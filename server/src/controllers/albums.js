import { pool } from '../models/db.js';

// Maak nieuw album
export const createAlbum = async (req, res) => {
  const { title, description, is_home = false } = req.body;

  try {
    // Als dit een home album moet worden, check eerst of er al een bestaat
    if (is_home) {
      const homeAlbumCheck = await pool.query(
        'SELECT id FROM albums WHERE is_home = true'
      );
      
      if (homeAlbumCheck.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Er bestaat al een home album. Bewerk het bestaande home album in plaats van een nieuwe aan te maken.' 
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO albums (title, description, is_home)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, is_home]
    );

    res.status(201).json({
      message: 'Album succesvol aangemaakt',
      album: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij aanmaken album', error: error.message });
  }
};

// Haal alle albums op
export const getAlbums = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              COUNT(p.id) as photo_count,
              MIN(p.filename) as cover_photo
       FROM albums a
       LEFT JOIN photos p ON p.album_id = a.id
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij ophalen albums', error: error.message });
  }
};

// Haal specifiek album op
export const getAlbum = async (req, res) => {
  const { id } = req.params;

  try {
    const albumResult = await pool.query(
      `SELECT a.*, COUNT(p.id) as photo_count
       FROM albums a
       LEFT JOIN photos p ON p.album_id = a.id
       WHERE a.id = $1
       GROUP BY a.id`,
      [id]
    );

    if (albumResult.rows.length === 0) {
      return res.status(404).json({ message: 'Album niet gevonden' });
    }

    // Haal foto's van het album op
    const photosResult = await pool.query(
      `SELECT * FROM photos 
       WHERE album_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    const album = albumResult.rows[0];
    album.photos = photosResult.rows;

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij ophalen album', error: error.message });
  }
};

// Update album
export const updateAlbum = async (req, res) => {
  const { id } = req.params;
  const { title, description, is_home = false } = req.body;

  try {
    // Als dit een home album wordt, update eerst alle andere albums
    if (is_home) {
      await pool.query(
        'UPDATE albums SET is_home = false WHERE is_home = true AND id != $1',
        [id]
      );
    }

    const result = await pool.query(
      `UPDATE albums 
       SET title = $1,
           description = $2,
           is_home = $3
       WHERE id = $4
       RETURNING *`,
      [title, description, is_home, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Album niet gevonden' });
    }

    res.json({
      message: 'Album succesvol bijgewerkt',
      album: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij updaten album', error: error.message });
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

  try {
    // Update alle geselecteerde foto's
    await pool.query(
      'UPDATE photos SET album_id = $1 WHERE id = ANY($2)',
      [id, photoIds]
    );

    res.json({ message: `${photoIds.length} foto's toegevoegd aan het album` });
  } catch (error) {
    console.error('Error adding photos to album:', error);
    res.status(500).json({ error: 'Fout bij toevoegen van foto\'s aan het album' });
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
    // Zet album_id op null voor alle geselecteerde foto's
    await pool.query(
      'UPDATE photos SET album_id = NULL WHERE id = ANY($1) AND album_id = $2',
      [photoIds, id]
    );

    res.json({ message: `${photoIds.length} foto's verwijderd uit het album` });
  } catch (error) {
    console.error('Error removing photos from album:', error);
    res.status(500).json({ error: 'Fout bij verwijderen van foto\'s uit het album' });
  }
}; 