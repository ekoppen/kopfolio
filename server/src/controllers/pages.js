import { pool } from '../models/db.js';
import slugify from 'slugify';

// Maak nieuwe pagina
const createPage = async (req, res) => {
  const { 
    title, 
    content, 
    description, 
    is_in_menu = false,
    parent_id = null,
    is_parent_only = false
  } = req.body;

  try {
    // Genereer basis slug van titel
    let slug = slugify(title, { lower: true, strict: true });

    // Check of slug al bestaat, zo ja, voeg nummer toe
    let counter = 1;
    let finalSlug = slug;
    while (true) {
      const slugCheck = await pool.query(
        'SELECT id FROM pages WHERE slug = $1',
        [finalSlug]
      );

      if (slugCheck.rows.length === 0) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Zorg ervoor dat content als JSON wordt opgeslagen
    const jsonContent = Array.isArray(content) ? content : [];

    const result = await pool.query(
      `INSERT INTO pages (
        title, content, description, slug, 
        is_in_menu, parent_id, is_parent_only
      )
      VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        title, 
        JSON.stringify(jsonContent), 
        description || '', 
        finalSlug,
        is_in_menu,
        parent_id,
        is_parent_only
      ]
    );

    // Parse de content terug naar JSON voor de response
    const page = {
      ...result.rows[0],
      content: result.rows[0].content ? result.rows[0].content : []
    };

    res.status(201).json({
      message: 'Pagina succesvol aangemaakt',
      page
    });
  } catch (error) {
    console.error('Fout bij aanmaken pagina:', error);
    res.status(500).json({ message: 'Fout bij aanmaken pagina', error: error.message });
  }
};

// Haal alle pagina's op
const getPages = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH RECURSIVE page_tree AS (
        SELECT 
          id, title, slug, description, content, 
          is_in_menu, menu_order, parent_id, 
          is_parent_only, settings, created_at, updated_at,
          is_fullscreen_slideshow, sub_order,
          ARRAY[]::integer[] as path,
          0 as level
        FROM pages
        WHERE parent_id IS NULL
        
        UNION ALL
        
        SELECT 
          p.id, p.title, p.slug, p.description, p.content, 
          p.is_in_menu, p.menu_order, p.parent_id, 
          p.is_parent_only, p.settings, p.created_at, p.updated_at,
          p.is_fullscreen_slideshow, p.sub_order,
          pt.path || p.parent_id,
          pt.level + 1
        FROM pages p
        JOIN page_tree pt ON pt.id = p.parent_id
      )
      SELECT 
        pt.*,
        (SELECT slug FROM pages WHERE id = pt.parent_id) as parent_slug,
        COALESCE(
          jsonb_agg(
            json_build_object(
              'id', c.id,
              'title', c.title,
              'slug', c.slug,
              'description', c.description,
              'content', c.content,
              'is_in_menu', c.is_in_menu,
              'menu_order', c.menu_order,
              'parent_id', c.parent_id,
              'parent_slug', (SELECT slug FROM pages WHERE id = c.parent_id),
              'is_parent_only', c.is_parent_only,
              'settings', c.settings,
              'created_at', c.created_at,
              'updated_at', c.updated_at,
              'is_fullscreen_slideshow', c.is_fullscreen_slideshow,
              'sub_order', c.sub_order
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::jsonb
        ) as children
      FROM page_tree pt
      LEFT JOIN pages c ON c.parent_id = pt.id
      GROUP BY pt.id, pt.title, pt.slug, pt.description, pt.content, 
               pt.is_in_menu, pt.menu_order, pt.parent_id, pt.is_parent_only,
               pt.settings, pt.created_at, pt.updated_at, pt.path, pt.level,
               pt.is_fullscreen_slideshow, pt.sub_order
      ORDER BY pt.path, 
               CASE 
                 WHEN pt.parent_id IS NULL THEN pt.menu_order 
                 ELSE pt.sub_order 
               END;
    `);

    res.json(result.rows.map(page => ({
      ...page,
      children: page.children || []
    })));
  } catch (error) {
    console.error('Error in getPages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Haal specifieke pagina op
const getPage = async (req, res) => {
  const { slug, id } = req.params;

  try {
    let query = `
      SELECT 
        id, title, slug, content, description, 
        is_in_menu, menu_order, parent_id, sub_order,
        is_parent_only, settings, created_at, updated_at,
        is_fullscreen_slideshow, menu_font_size
      FROM pages WHERE `;
    let params = [];

    if (id) {
      query += 'id = $1';
      params = [id];
    } else {
      query += 'slug = $1';
      params = [slug];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagina niet gevonden' });
    }

    // Parse de content voor de pagina
    const page = {
      ...result.rows[0],
      content: result.rows[0].content ? result.rows[0].content : [],
      is_parent_only: result.rows[0].is_parent_only || false,
      is_fullscreen_slideshow: result.rows[0].is_fullscreen_slideshow || false
    };

    console.log('Sending page:', page);

    res.json(page);
  } catch (error) {
    console.error('Fout bij ophalen pagina:', error);
    res.status(500).json({ message: 'Fout bij ophalen pagina', error: error.message });
  }
};

// Update menu order
const updateMenuOrder = async (req, res) => {
  const { pages } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update elke pagina's menu status en volgorde
    for (const { id, is_in_menu, menu_order } of pages) {
      await client.query(
        `UPDATE pages 
         SET is_in_menu = $1, 
             menu_order = $2
         WHERE id = $3`,
        [is_in_menu, menu_order, id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Menu volgorde succesvol bijgewerkt' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating menu order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fout bij bijwerken menu volgorde' 
    });
  } finally {
    client.release();
  }
};

// Update een pagina
const updatePage = async (req, res) => {
  const { id } = req.params;
  const { 
    title, content, slug, is_in_menu, menu_order, 
    settings, parent_id, description, is_parent_only,
    is_fullscreen_slideshow
  } = req.body;

  // Voorkom dat een pagina zichzelf als parent heeft
  if (parent_id && parseInt(parent_id) === parseInt(id)) {
    return res.status(400).json({ 
      message: 'Een pagina kan niet zichzelf als parent hebben' 
    });
  }

  try {
    // Haal eerst de bestaande pagina op
    const existingPage = await pool.query(
      'SELECT sub_order, parent_id FROM pages WHERE id = $1',
      [id]
    );

    if (existingPage.rows.length === 0) {
      return res.status(404).json({ message: 'Pagina niet gevonden' });
    }

    const currentSubOrder = existingPage.rows[0].sub_order;
    const currentParentId = existingPage.rows[0].parent_id;

    // Als de titel is gewijzigd, update de slug
    let newSlug = slug;
    if (title) {
      newSlug = slugify(title, { lower: true, strict: true });
      
      // Check of de nieuwe slug al bestaat
      let counter = 1;
      let finalSlug = newSlug;
      while (true) {
        const slugCheck = await pool.query(
          'SELECT id FROM pages WHERE slug = $1 AND id != $2',
          [finalSlug, id]
        );

        if (slugCheck.rows.length === 0) break;
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }
      newSlug = finalSlug;
    }

    // Bouw de update query dynamisch op
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramCount}::jsonb`);
      values.push(JSON.stringify(content));
      paramCount++;
    }

    if (newSlug !== undefined) {
      updateFields.push(`slug = $${paramCount}`);
      values.push(newSlug);
      paramCount++;
    }

    if (is_in_menu !== undefined) {
      updateFields.push(`is_in_menu = $${paramCount}`);
      values.push(is_in_menu);
      paramCount++;
    }

    // Behoud de bestaande sub_order
    updateFields.push(`sub_order = $${paramCount}`);
    values.push(currentSubOrder);
    paramCount++;

    if (settings !== undefined) {
      updateFields.push(`settings = $${paramCount}::jsonb`);
      values.push(JSON.stringify(settings));
      paramCount++;
    }

    if (parent_id !== undefined) {
      updateFields.push(`parent_id = $${paramCount}`);
      values.push(parent_id);
      paramCount++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (is_parent_only !== undefined) {
      updateFields.push(`is_parent_only = $${paramCount}`);
      values.push(is_parent_only);
      paramCount++;
    }

    if (is_fullscreen_slideshow !== undefined) {
      updateFields.push(`is_fullscreen_slideshow = $${paramCount}`);
      values.push(is_fullscreen_slideshow);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Voeg het ID toe als laatste parameter
    values.push(id);

    const query = `
      UPDATE pages 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagina niet gevonden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ 
      message: 'Error updating page', 
      error: error.message 
    });
  }
};

// Verwijder pagina
const deletePage = async (req, res) => {
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

// Update slideshow settings
const updateSlideShowSettings = async (req, res) => {
  const { id } = req.params;
  const { 
    transition = 'fade',
    speed = 1000,
    interval = 5000,
    autoPlay = true,
    show_info = false
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pages 
       SET settings = jsonb_set(
         COALESCE(settings, '{}'::jsonb),
         '{slideshow}',
         $1::jsonb
       )
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify({ transition, speed, interval, autoPlay, show_info }), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagina niet gevonden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fout bij updaten slideshow instellingen:', error);
    res.status(500).json({ message: 'Fout bij updaten slideshow instellingen' });
  }
};

/**
 * Update de sub_order van pagina's
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const updateSubOrder = async (req, res) => {
  const { pages } = req.body;
  
  if (!Array.isArray(pages)) {
    return res.status(400).json({ message: 'Pages moet een array zijn' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update de sub_order voor elke pagina
      for (let i = 0; i < pages.length; i++) {
        const { id, parent_id } = pages[i];
        await client.query(
          'UPDATE pages SET sub_order = $1 WHERE id = $2',
          [i, id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Sub_order succesvol bijgewerkt' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating sub_order:', error);
    res.status(500).json({ 
      message: 'Error updating sub_order', 
      error: error.message 
    });
  }
};

export {
  createPage,
  getPages,
  getPage,
  updateMenuOrder,
  updatePage,
  deletePage,
  updateSlideShowSettings,
  updateSubOrder
}; 