import { pool } from '../models/db.js';
import slugify from 'slugify';

// Maak nieuwe pagina
export const createPage = async (req, res) => {
  const { title, content } = req.body;

  try {
    // Genereer slug van titel
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check of slug al bestaat, zo ja, voeg nummer toe
    while (true) {
      const slugCheck = await pool.query(
        'SELECT id FROM pages WHERE slug = $1',
        [slug]
      );

      if (slugCheck.rows.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await pool.query(
      `INSERT INTO pages (title, content, slug)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, content, slug]
    );

    res.status(201).json({
      message: 'Pagina succesvol aangemaakt',
      page: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij aanmaken pagina', error: error.message });
  }
};

// Haal alle pagina's op
export const getPages = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pages 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij ophalen pagina\'s', error: error.message });
  }
};

// Haal specifieke pagina op
export const getPage = async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM pages WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagina niet gevonden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Fout bij ophalen pagina', error: error.message });
  }
};

// Update pagina
export const updatePage = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    // Als de titel verandert, update ook de slug
    let slug = null;
    if (title) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      // Check of nieuwe slug al bestaat (behalve voor huidige pagina)
      while (true) {
        const slugCheck = await pool.query(
          'SELECT id FROM pages WHERE slug = $1 AND id != $2',
          [slug, id]
        );

        if (slugCheck.rows.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const result = await pool.query(
      `UPDATE pages 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           slug = COALESCE($3, slug)
       WHERE id = $4
       RETURNING *`,
      [title, content, slug, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagina niet gevonden' });
    }

    res.json({
      message: 'Pagina succesvol bijgewerkt',
      page: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij updaten pagina', error: error.message });
  }
};

// Verwijder pagina
export const deletePage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM pages WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagina niet gevonden' });
    }

    res.json({ message: 'Pagina succesvol verwijderd' });
  } catch (error) {
    res.status(500).json({ message: 'Fout bij verwijderen pagina', error: error.message });
  }
}; 