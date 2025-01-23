import { pool } from '../models/db.js';
import ExifReader from 'exif-reader';
import sharp from 'sharp';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = '/app/public/uploads';

const calculateHash = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

const isValidImageFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png'].includes(ext);
};

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
        
        if (!isValidImageFile(file.originalname)) {
          errors.push(`${file.originalname} is geen geldig afbeeldingsbestand`);
          continue;
        }

        // Gebruik de bestandsnaam die Multer heeft gegenereerd
        const filename = file.filename;
        const filepath = file.path;
        const thumbnailPath = path.join(uploadDir, `thumb_${filename}`);
        
        console.log('Original file path:', filepath);
        console.log('Thumbnail path:', thumbnailPath);

        // Bereken de hash van het originele bestand
        const hash = await calculateHash(filepath);
        console.log('Calculated hash:', hash);

        // Maak thumbnail
        await sharp(filepath)
          .resize(400, 400, {
            fit: 'cover',
            position: 'centre'
          })
          .toFile(thumbnailPath);

        let exifData = null;
        let dateOriginal = null;

        try {
          // Lees EXIF data
          const buffer = await fsPromises.readFile(filepath);
          exifData = await ExifReader.load(buffer);
          dateOriginal = exifData?.exif?.DateTimeOriginal?.description;
        } catch (exifError) {
          console.log('No EXIF data found or error reading EXIF:', exifError);
        }

        // Voeg foto toe aan database
        const result = await pool.query(
          'INSERT INTO photos (filename, original_date, hash, size) VALUES ($1, $2, $3, $4) RETURNING *',
          [filename, dateOriginal, hash, file.size]
        );

        console.log('Photo added to database:', result.rows[0]);
        uploadResults.push(result.rows[0]);
      } catch (err) {
        console.error('Error processing file:', file.originalname, err);
        errors.push({
          filename: file.originalname,
          error: err.message
        });
      }
    }

    res.json({
      message: 'Foto\'s verwerkt',
      success: uploadResults,
      errors: errors
    });
  } catch (error) {
    console.error('Error in uploadPhotos:', error);
    res.status(500).json({ error: 'Server error bij uploaden foto\'s' });
  }
};

// Haal alle foto's op
export const getPhotos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fout bij ophalen foto\'s:', error);
    res.status(500).json({ message: 'Fout bij ophalen foto\'s' });
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
    const filepath = path.join(uploadDir, filename);
    const thumbPath = path.join(uploadDir, `thumb_${filename}`);

    // Verwijder de bestanden als ze bestaan
    try {
      await fsPromises.unlink(filepath);
      await fsPromises.unlink(thumbPath);
    } catch (err) {
      console.error('Error deleting files:', err);
    }

    // Verwijder database record
    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    res.json({ message: 'Foto succesvol verwijderd' });
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    res.status(500).json({ message: 'Fout bij verwijderen foto' });
  }
};

export const checkDuplicates = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { hashes } = req.body;
    
    if (!hashes) {
      console.log('No hashes received in request body');
      return res.status(400).json({ 
        message: 'Geen hashes opgegeven in request body',
        received: req.body 
      });
    }

    if (!Array.isArray(hashes)) {
      console.log('Hashes is not an array:', hashes);
      return res.status(400).json({ 
        message: 'Hashes moet een array zijn',
        received: hashes 
      });
    }

    console.log('Checking duplicates for hashes:', hashes);
    
    if (hashes.length === 0) {
      console.log('Empty hashes array received');
      return res.json({ duplicates: [] });
    }

    // Valideer dat alle hashes strings zijn
    const invalidHashes = hashes.filter(hash => typeof hash !== 'string' || hash.length !== 64);
    if (invalidHashes.length > 0) {
      console.log('Invalid hashes detected:', invalidHashes);
      return res.status(400).json({ 
        message: 'Ongeldige hash format gevonden',
        invalidHashes: invalidHashes
      });
    }

    console.log('Executing database query with hashes:', hashes);
    
    try {
      const result = await pool.query(
        'SELECT DISTINCT hash FROM photos WHERE hash = ANY($1::text[])',
        [hashes]
      );

      console.log('Database query completed successfully');
      console.log('Query result:', result.rows);
      
      const duplicates = result.rows.map(row => row.hash);
      console.log('Found duplicates:', duplicates);
      
      return res.json({ duplicates });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error in checkDuplicates:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Server error bij controleren duplicaten',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 