import { pool } from '../models/db.js';
import ExifReader from 'exif-reader';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Upload en verwerk meerdere foto's
export const uploadPhotos = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Geen foto\'s geüpload' });
    }

    const { albumId, title, description } = req.body;
    console.log('Album ID:', albumId);
    console.log('Title:', title);
    console.log('Description:', description);

    const uploadResults = [];
    const errors = [];

    for (const file of req.files) {
      try {
        console.log('Processing file:', file.originalname);
        const filename = file.filename;
        const thumbnailFilename = `thumb_${filename}`;
        const uploadDir = '/app/public/uploads';
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);
        
        console.log('Original file path:', file.path);
        console.log('Thumbnail path:', thumbnailPath);
        console.log('Upload directory:', uploadDir);

        // Maak thumbnail
        try {
          await sharp(file.path)
            .resize(200, 200, {
              fit: 'cover',
              position: 'centre'
            })
            .toFile(thumbnailPath);
          console.log('Thumbnail created successfully');
        } catch (err) {
          console.error('Error creating thumbnail:', err);
          throw err;
        }

        // Voeg foto toe aan database
        const result = await pool.query(
          'INSERT INTO photos (filename, thumbnail_filename, album_id, title, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [filename, thumbnailFilename, albumId || null, title || null, description || null]
        );

        uploadResults.push(result.rows[0]);
        console.log('Photo added to database:', result.rows[0]);
      } catch (err) {
        console.error('Error processing file:', file.originalname, err);
        errors.push({
          filename: file.originalname,
          error: err.message
        });
      }
    }

    if (uploadResults.length === 0) {
      return res.status(500).json({ 
        error: 'Geen enkele foto kon worden geüpload',
        details: errors
      });
    }

    res.json({
      message: `${uploadResults.length} foto's succesvol geüpload${errors.length > 0 ? ` (${errors.length} mislukt)` : ''}`,
      photos: uploadResults,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error in uploadPhotos:', err);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het uploaden van de foto\'s' });
  }
};

// Haal alle foto's op
export const getPhotos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, a.title as album_title 
       FROM photos p 
       LEFT JOIN albums a ON p.album_id = a.id 
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij ophalen foto\'s', error: error.message });
  }
};

// Haal foto's van specifiek album op
export const getPhotosByAlbum = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM photos 
       WHERE album_id = $1 
       ORDER BY created_at DESC`,
      [req.params.albumId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij ophalen album foto\'s', error: error.message });
  }
};

// Update foto informatie
export const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title, description, album_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE photos 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           album_id = COALESCE($3, album_id)
       WHERE id = $4
       RETURNING *`,
      [title, description, album_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Foto niet gevonden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij updaten foto', error: error.message });
  }
};

// Verwijder foto
export const deletePhoto = async (req, res) => {
  const { id } = req.params;

  try {
    // Haal eerst de bestandsnaam op
    const photoResult = await pool.query(
      'SELECT filename FROM photos WHERE id = $1',
      [id]
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Foto niet gevonden' });
    }

    const filename = photoResult.rows[0].filename;
    const thumbnailFilename = 'thumb_' + filename;

    // Verwijder de bestanden
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await Promise.all([
      fs.unlink(path.join(uploadDir, filename)).catch(() => {}),
      fs.unlink(path.join(uploadDir, thumbnailFilename)).catch(() => {})
    ]);

    // Verwijder database record
    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    res.json({ message: 'Foto succesvol verwijderd' });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij verwijderen foto', error: error.message });
  }
}; 