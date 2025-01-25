import { pool } from '../models/db.js';

// Maak nieuw album aan
export const createAlbum = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { title, description, is_home } = req.body;

    if (is_home) {
      // Check of er al een home album bestaat met FOR UPDATE om race conditions te voorkomen
      const homeCheck = await client.query(
        'SELECT id FROM albums WHERE is_home = true FOR UPDATE'
      );
      if (homeCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: 'Er bestaat al een home album. Bewerk het bestaande home album in plaats van een nieuwe aan te maken.' 
        });
      }
    }

    const result = await client.query(
      'INSERT INTO albums (title, description, is_home) VALUES ($1, $2, $3) RETURNING *',
      [title, description, is_home]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createAlbum:', error);
    res.status(500).json({ message: 'Fout bij aanmaken album' });
  } finally {
    client.release();
  }
};

// Haal alle albums op
export const getAlbums = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*,
             COUNT(DISTINCT pa.photo_id) as photo_count,
             (
               SELECT p.filename
               FROM photos p
               JOIN photos_albums pa2 ON p.id = pa2.photo_id
               WHERE pa2.album_id = a.id
               ORDER BY p.created_at DESC
               LIMIT 1
             ) as cover_photo
      FROM albums a
      LEFT JOIN photos_albums pa ON a.id = pa.album_id
      GROUP BY a.id
      ORDER BY 
        CASE WHEN a.is_home THEN 0 ELSE 1 END,
        a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Fout bij ophalen albums:', error);
    res.status(500).json({ message: 'Fout bij ophalen albums', error: error.message });
  }
};

// Haal specifiek album op
export const getAlbum = async (req, res) => {
  const { id } = req.params;

  try {
    const albumResult = await pool.query(
      `SELECT a.*, COUNT(DISTINCT pa.photo_id) as photo_count
       FROM albums a
       LEFT JOIN photos_albums pa ON a.id = pa.album_id
       WHERE a.id = $1
       GROUP BY a.id`,
      [id]
    );

    if (albumResult.rows.length === 0) {
      return res.status(404).json({ message: 'Album niet gevonden' });
    }

    // Haal foto's van het album op
    const photosResult = await pool.query(
      `SELECT p.* 
       FROM photos p
       JOIN photos_albums pa ON p.id = pa.photo_id
       WHERE pa.album_id = $1 
       ORDER BY pa.position ASC, p.created_at DESC`,
      [id]
    );

    const album = albumResult.rows[0];
    album.photos = photosResult.rows;

    res.json(album);
  } catch (error) {
    console.error('Fout bij ophalen album:', error);
    res.status(500).json({ message: 'Fout bij ophalen album', error: error.message });
  }
};

// Update album
export const updateAlbum = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { title, description, is_home, cover_photo } = req.body;

    // Haal eerst het huidige album op met FOR UPDATE
    const currentAlbum = await client.query(
      'SELECT is_home FROM albums WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (currentAlbum.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Album niet gevonden' });
    }

    if (is_home && !currentAlbum.rows[0].is_home) {
      // Als we dit album home willen maken, check dan of er al een ander home album is
      const homeCheck = await client.query(
        'SELECT id FROM albums WHERE is_home = true AND id != $1 FOR UPDATE',
        [id]
      );
      if (homeCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: 'Er bestaat al een home album. Er kan maar één home album zijn.' 
        });
      }
    }

    const result = await client.query(
      `UPDATE albums 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           is_home = COALESCE($3, is_home),
           cover_photo = COALESCE($4, cover_photo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, description, is_home, cover_photo, id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateAlbum:', error);
    res.status(500).json({ message: 'Fout bij updaten album' });
  } finally {
    client.release();
  }
};

// Verwijder album
export const deleteAlbum = async (req, res) => {
  const { id } = req.params;

  try {
    // Check of dit niet het home album is
    const albumCheck = await pool.query(
      'SELECT is_home FROM albums WHERE id = $1',
      [id]
    );

    if (albumCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Album niet gevonden' });
    }

    if (albumCheck.rows[0].is_home) {
      return res.status(400).json({ message: 'Het home album kan niet worden verwijderd' });
    }

    // Verwijder het album (foto's worden automatisch ontkoppeld door de foreign key)
    await pool.query('DELETE FROM albums WHERE id = $1', [id]);

    res.json({ message: 'Album succesvol verwijderd' });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij verwijderen album', error: error.message });
  }
};

// Voeg foto's toe aan album
export const addPhotosToAlbum = async (req, res) => {
  const { id } = req.params;
  const { photoIds } = req.body;

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return res.status(400).json({ error: 'Geen foto\'s geselecteerd' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Haal de huidige hoogste positie op
    const positionResult = await client.query(
      'SELECT COALESCE(MAX(position), -1) as max_position FROM photos_albums WHERE album_id = $1',
      [id]
    );
    let nextPosition = positionResult.rows[0].max_position + 1;

    // Voeg elke foto toe met een oplopende positie
    for (const photoId of photoIds) {
      await client.query(
        'INSERT INTO photos_albums (photo_id, album_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [photoId, id, nextPosition++]
      );
    }

    await client.query('COMMIT');
    res.json({ message: `${photoIds.length} foto's toegevoegd aan het album` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding photos to album:', error);
    res.status(500).json({ error: 'Fout bij toevoegen van foto\'s aan het album' });
  } finally {
    client.release();
  }
};

// Verwijder foto's uit album
export const removePhotosFromAlbum = async (req, res) => {
  const { id } = req.params;
  const { photoIds } = req.body;

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return res.status(400).json({ error: 'Geen foto\'s geselecteerd' });
  }

  try {
    // Verwijder de koppelingen tussen de foto's en het album
    await pool.query(
      'DELETE FROM photos_albums WHERE album_id = $1 AND photo_id = ANY($2)',
      [id, photoIds]
    );

    res.json({ message: `${photoIds.length} foto\'s verwijderd uit het album` });
  } catch (error) {
    console.error('Error removing photos from album:', error);
    res.status(500).json({ error: 'Fout bij verwijderen van foto\'s uit het album' });
  }
}; 