import { pool } from '../models/db.js';
import exifReader from 'exif-reader';
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

        const filename = file.filename;
        const filepath = file.path;
        const thumbnailPath = path.join(uploadDir, `thumb_${filename}`);
        
        console.log('Original file path:', filepath);
        console.log('Thumbnail path:', thumbnailPath);

        // Bereken de hash van het originele bestand
        const hash = await calculateHash(filepath);
        console.log('Calculated hash:', hash);

        let exifData = null;
        let dateOriginal = null;

        try {
          // Lees metadata met sharp
          console.log('Reading metadata with sharp...');
          const metadata = await sharp(filepath).metadata();
          console.log('Sharp metadata:', metadata);
          
          if (metadata.exif) {
            console.log('EXIF data found in metadata');
            try {
              exifData = exifReader(metadata.exif);
              console.log('Raw EXIF data:', exifData);
              
              dateOriginal = exifData?.exif?.DateTimeOriginal?.description;
              console.log('Original date:', dateOriginal);
              
              // Sla alle beschikbare metadata op
              const processedExif = {
                // Basis metadata van Sharp
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                space: metadata.space,
                hasAlpha: metadata.hasAlpha,
                size: file.size,
                
                // Camera informatie
                make: exifData.Image?.Make,
                model: exifData.Image?.Model,
                software: exifData.Image?.Software,
                
                // Foto instellingen
                exposureTime: exifData.Photo?.ExposureTime,
                fNumber: exifData.Photo?.FNumber,
                iso: exifData.Photo?.ISOSpeedRatings,
                focalLength: exifData.Photo?.FocalLength,
                flash: exifData.Photo?.Flash,
                
                // Overige EXIF data
                orientation: exifData.Image?.Orientation,
                dateTime: exifData.Photo?.DateTimeOriginal,
                
                // Extra EXIF data
                exposureProgram: exifData.Photo?.ExposureProgram,
                meteringMode: exifData.Photo?.MeteringMode,
                whiteBalance: exifData.Photo?.WhiteBalance,
                focalLengthIn35mm: exifData.Photo?.FocalLengthIn35mmFilm,
                
                // Sla ook de ruwe metadata op voor volledigheid
                rawMetadata: metadata,
                rawExif: exifData
              };

              exifData = processedExif;
              console.log('Processed EXIF data:', exifData);
            } catch (exifError) {
              console.error('Error processing EXIF:', exifError);
              // Als er een fout optreedt bij het verwerken van EXIF, sla dan alleen de basis metadata op
              exifData = {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                space: metadata.space,
                hasAlpha: metadata.hasAlpha,
                size: file.size,
                rawMetadata: metadata
              };
            }
          } else {
            console.log('No EXIF data found in metadata');
            // Als er geen EXIF data is, sla dan alleen de basis metadata op
            exifData = {
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
              space: metadata.space,
              hasAlpha: metadata.hasAlpha,
              size: file.size,
              rawMetadata: metadata
            };
          }
        } catch (exifError) {
          console.error('Error reading EXIF:', exifError);
        }

        // Maak thumbnail
        await sharp(filepath)
          .resize(400, 400, {
            fit: 'cover',
            position: 'centre'
          })
          .toFile(thumbnailPath);

        // Voeg foto toe aan database
        console.log('Inserting into database with EXIF:', exifData);
        const result = await pool.query(
          'INSERT INTO photos (filename, original_date, hash, size, exif_data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [filename, dateOriginal, hash, file.size, exifData ? JSON.stringify(exifData) : null]
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
    const result = await pool.query(`
      SELECT p.*, a.title as album_title 
      FROM photos p 
      LEFT JOIN albums a ON p.album_id = a.id 
      ORDER BY p.created_at DESC
    `);
    
    // Voeg album informatie toe aan elke foto
    const photos = result.rows.map(photo => ({
      ...photo,
      album: photo.album_id ? {
        id: photo.album_id,
        title: photo.album_title
      } : null
    }));

    res.json(photos);
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