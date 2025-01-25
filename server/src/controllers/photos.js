import { pool } from '../models/db.js';
import exifReader from 'exif-reader';
import sharp from 'sharp';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';
import { uploadDirs, getUploadPath } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    if (!req.files || !req.files.photos) {
      console.log('Geen foto\'s gevonden in request:', { files: req.files });
      return res.status(400).json({ error: 'Geen foto\'s geüpload' });
    }

    const uploadResults = [];
    const errors = [];
    const photos = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];

    console.log('Verwerken van', photos.length, 'foto\'s');

    for (const file of photos) {
      let filename = null;
      let filepath = null;
      let thumbnailPath = null;

      try {
        console.log('Processing file:', file.name);
        
        if (!isValidImageFile(file.name)) {
          console.log('Ongeldig bestandsformaat:', file.name);
          errors.push(`${file.name} is geen geldig afbeeldingsbestand`);
          continue;
        }

        filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.name);
        filepath = getUploadPath('photos', filename);
        thumbnailPath = getUploadPath('thumbs', `thumb_${filename}`);
        
        console.log('Moving file to:', filepath);
        await file.mv(filepath);

        // Bereken de hash van het originele bestand
        const hash = await calculateHash(filepath);
        console.log('Calculated hash:', hash);

        let exifData = null;
        let dateOriginal = null;
        let width = null;
        let height = null;

        try {
          // Lees metadata met sharp
          console.log('Reading metadata with sharp...');
          const metadata = await sharp(filepath).metadata();
          console.log('Sharp metadata:', metadata);

          width = metadata.width;
          height = metadata.height;

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
          // Als er een fout optreedt bij het lezen van metadata, probeer dan de afmetingen direct te krijgen
          try {
            const imageInfo = await sharp(filepath).metadata();
            width = imageInfo.width;
            height = imageInfo.height;
          } catch (sharpError) {
            console.error('Error getting image dimensions:', sharpError);
            errors.push(`Kon metadata niet lezen voor ${file.name}`);
            
            // Ruim bestanden op
            if (filepath && fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
            continue;
          }
        }

        try {
          // Maak thumbnail
          await sharp(filepath)
            .resize(400, 400, {
              fit: 'cover',
              position: 'centre'
            })
            .toFile(thumbnailPath);
        } catch (thumbError) {
          console.error('Error creating thumbnail:', thumbError);
          errors.push(`Kon geen thumbnail maken voor ${file.name}`);
          
          // Ruim bestanden op
          if (filepath && fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          continue;
        }

        // Voeg foto toe aan database
        console.log('Inserting into database with data:', {
          filename,
          dateOriginal,
          hash,
          size: file.size,
          width,
          height,
          exifData
        });

        const result = await pool.query(
          `INSERT INTO photos (
            filename, taken_at, hash, size, width, height, 
            make, model, exif_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
          RETURNING *`,
          [
            filename,
            dateOriginal,
            hash,
            file.size,
            width,
            height,
            exifData?.make || null,
            exifData?.model || null,
            exifData ? JSON.stringify(exifData) : null
          ]
        );

        console.log('Photo added to database:', result.rows[0]);
        uploadResults.push(result.rows[0]);
      } catch (err) {
        console.error('Error processing file:', file.name, err);
        errors.push({
          filename: file.name,
          error: err.message
        });
        
        // Probeer bestanden op te ruimen bij een fout
        try {
          if (filepath && fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          if (thumbnailPath && fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up files:', cleanupError);
        }
      }
    }

    if (uploadResults.length === 0 && errors.length > 0) {
      return res.status(400).json({
        error: 'Geen enkele foto kon worden verwerkt',
        details: errors
      });
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
      SELECT p.*, 
             array_agg(DISTINCT jsonb_build_object(
               'id', a.id,
               'title', a.title
             )) FILTER (WHERE a.id IS NOT NULL) as albums
      FROM photos p 
      LEFT JOIN photos_albums pa ON p.id = pa.photo_id
      LEFT JOIN albums a ON pa.album_id = a.id 
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    // Verwerk de resultaten
    const photos = result.rows.map(photo => ({
      ...photo,
      albums: photo.albums || []
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
      `SELECT p.* 
       FROM photos p
       JOIN photos_albums pa ON p.id = pa.photo_id
       WHERE pa.album_id = $1 
       ORDER BY pa.position ASC, p.created_at DESC`,
      [req.params.albumId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fout bij ophalen album foto\'s:', error);
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
    const filepath = getUploadPath('photos', filename);
    const thumbPath = getUploadPath('thumbs', `thumb_${filename}`);

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