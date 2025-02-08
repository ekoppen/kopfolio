import { pool } from '../models/db.js';
import slugify from 'slugify';

// Maak nieuwe pagina
export const createPage = async (req, res) => {
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
export const getPages = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH RECURSIVE page_tree AS (
        SELECT 
          id, title, slug, description, content, 
          is_in_menu, menu_order, parent_id, 
          is_parent_only, settings, created_at, updated_at,
          is_fullscreen_slideshow,
          ARRAY[]::integer[] as path,
          0 as level
        FROM pages
        WHERE parent_id IS NULL
        
        UNION ALL
        
        SELECT 
          p.id, p.title, p.slug, p.description, p.content, 
          p.is_in_menu, p.menu_order, p.parent_id, 
          p.is_parent_only, p.settings, p.created_at, p.updated_at,
          p.is_fullscreen_slideshow,
          pt.path || p.parent_id,
          pt.level + 1
        FROM pages p
        JOIN page_tree pt ON pt.id = p.parent_id
      )
      SELECT 
        pt.*,
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
              'is_parent_only', c.is_parent_only,
              'settings', c.settings,
              'created_at', c.created_at,
              'updated_at', c.updated_at,
              'is_fullscreen_slideshow', c.is_fullscreen_slideshow
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::jsonb
        ) as children
      FROM page_tree pt
      LEFT JOIN pages c ON c.parent_id = pt.id
      GROUP BY pt.id, pt.title, pt.slug, pt.description, pt.content, 
               pt.is_in_menu, pt.menu_order, pt.parent_id, pt.is_parent_only,
               pt.settings, pt.created_at, pt.updated_at, pt.path, pt.level,
               pt.is_fullscreen_slideshow
      ORDER BY pt.path, pt.menu_order;
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
export const getPage = async (req, res) => {
  const { slug, id } = req.params;

  try {
    let query = `
      SELECT 
        id, title, slug, content, description, 
        is_in_menu, menu_order, parent_id, 
        is_parent_only, settings, created_at, updated_at,
        is_fullscreen_slideshow
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
export const updateMenuOrder = async (req, res) => {
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
export const updatePage = async (req, res) => {
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

    // Check voor cyclische referenties als er een parent_id is
    if (parent_id) {
      const cycleCheck = await pool.query(`
        WITH RECURSIVE page_tree AS (
          SELECT id, parent_id, 1 as level
          FROM pages
          WHERE id = $1
          
          UNION
          
          SELECT p.id, p.parent_id, pt.level + 1
          FROM pages p
          JOIN page_tree pt ON p.id = pt.parent_id
        )
        SELECT COUNT(*) FROM page_tree WHERE id = $2
      `, [parent_id, id]);

      if (cycleCheck.rows[0].count > 0) {
        return res.status(400).json({ 
          message: 'Deze parent-child relatie zou een cyclische referentie creëren' 
        });
      }
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

    if (menu_order !== undefined) {
      updateFields.push(`menu_order = $${paramCount}`);
      values.push(menu_order);
      paramCount++;
    }

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

// Update slideshow settings
export const updateSlideShowSettings = async (req, res) => {
  const { id } = req.params;
  const { interval, transition, autoPlay } = req.body;

  try {
    // Controleer of het de home pagina is
    const page = await pool.query(
      'SELECT * FROM pages WHERE id = $1',
      [id]
    );

    if (!page.rows[0] || page.rows[0].slug !== 'home') {
      return res.status(400).json({
        success: false,
        message: 'Slideshow instellingen kunnen alleen voor de home pagina worden aangepast'
      });
    }

    // Update de instellingen
    await pool.query(
      `UPDATE pages 
       SET settings = jsonb_set(
         COALESCE(settings, '{}'::jsonb),
         '{slideshow}',
         $1::jsonb
       )
       WHERE id = $2`,
      [JSON.stringify({ interval, transition, autoPlay }), id]
    );

    res.json({
      success: true,
      message: 'Slideshow instellingen bijgewerkt'
    });
  } catch (error) {
    console.error('Error updating slideshow settings:', error);
    res.status(500).json({
      success: false,
      message: 'Fout bij bijwerken slideshow instellingen'
    });
  }
}; 