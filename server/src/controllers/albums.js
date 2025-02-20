import { pool } from '../models/db.js';

// Maak nieuw album aan
export const createAlbum = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ 
      success: false,
      message: 'Titel is verplicht' 
    });
  }

  try {
    // Genereer een slug op basis van de titel
    let slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check of de slug al bestaat
    const existingAlbum = await pool.query(
      'SELECT id FROM albums WHERE slug = $1',
      [slug]
    );

    // Als de slug al bestaat, voeg een nummer toe
    if (existingAlbum.rows.length > 0) {
      const count = await pool.query(
        'SELECT COUNT(*) FROM albums WHERE slug LIKE $1',
        [`${slug}%`]
      );
      slug = `${slug}-${count.rows[0].count + 1}`;
    }

    const result = await pool.query(
      'INSERT INTO albums (title, slug) VALUES ($1, $2) RETURNING *',
      [title, slug]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in createAlbum:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fout bij aanmaken album'
    });
  }
};

// Haal alle albums op
export const getAlbums = async (req, res) => {
  try {
    // Haal eerst de albums op
    const albumsResult = await pool.query(`
      SELECT a.*,
             COUNT(DISTINCT pa.photo_id) as photo_count,
             (
               SELECT p.filename
               FROM photos p
               WHERE p.id = a.cover_photo_id
             ) as cover_photo
      FROM albums a
      LEFT JOIN photos_albums pa ON a.id = pa.album_id
      GROUP BY a.id
      ORDER BY 
        CASE WHEN a.is_home THEN 0 ELSE 1 END,
        a.created_at DESC
    `);

    // Als de query parameter include=photos is meegegeven, haal dan ook de foto's op
    if (req.query.include === 'photos') {
      // Haal voor elk album de foto's op
      const albums = await Promise.all(albumsResult.rows.map(async (album) => {
        const photosResult = await pool.query(`
          SELECT p.*
          FROM photos p
          JOIN photos_albums pa ON p.id = pa.photo_id
          WHERE pa.album_id = $1
          ORDER BY pa.position ASC
        `, [album.id]);
        
        return {
          ...album,
          photos: photosResult.rows
        };
      }));
      
      res.json(albums);
    } else {
      res.json(albumsResult.rows);
    }
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

// Update album informatie
export const updateAlbum = async (req, res) => {
  const { id } = req.params;
  const { title, description, is_home } = req.body;

  try {
    const result = await pool.query(
      `UPDATE albums 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           is_home = COALESCE($3, is_home),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, description, is_home, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Album niet gevonden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in updateAlbum:', error);
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

// Update album cover foto
export const updateAlbumCover = async (req, res) => {
  const { id } = req.params;
  const { photoId } = req.body;

  try {
    // Controleer eerst of de foto bestaat en in het album zit
    const photoCheck = await pool.query(
      `SELECT 1 FROM photos_albums 
       WHERE album_id = $1 AND photo_id = $2`,
      [id, photoId]
    );

    if (photoCheck.rows.length === 0) {
      return res.status(400).json({ 
        message: 'De geselecteerde foto bestaat niet of zit niet in dit album' 
      });
    }

    const result = await pool.query(
      `UPDATE albums 
       SET cover_photo_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [photoId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Album niet gevonden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating album cover:', error);
    res.status(500).json({ message: 'Fout bij updaten album cover', error: error.message });
  }
};

// Update foto volgorde in album
export const updatePhotoOrder = async (req, res) => {
  const { id } = req.params;
  const { photoOrder } = req.body; // Array van photo IDs in de gewenste volgorde

  if (!Array.isArray(photoOrder)) {
    return res.status(400).json({ message: 'Foto volgorde moet een array zijn' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Controleer of alle foto's in het album zitten
    const photoCheck = await client.query(
      `SELECT photo_id FROM photos_albums 
       WHERE album_id = $1 AND photo_id = ANY($2)`,
      [id, photoOrder]
    );

    if (photoCheck.rows.length !== photoOrder.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Niet alle opgegeven foto\'s zitten in dit album' 
      });
    }

    // Update de positie van elke foto
    await Promise.all(photoOrder.map((photoId, index) => 
      client.query(
        `UPDATE photos_albums 
         SET position = $1 
         WHERE album_id = $2 AND photo_id = $3`,
        [index, id, photoId]
      )
    ));

    await client.query('COMMIT');
    res.json({ message: 'Foto volgorde succesvol bijgewerkt' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating photo order:', error);
    res.status(500).json({ message: 'Fout bij updaten foto volgorde', error: error.message });
  } finally {
    client.release();
  }
}; 