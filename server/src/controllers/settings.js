import { pool } from '../models/db.js';
import path from 'path';
import { promises as fs } from 'fs';
import { uploadDirs, getUploadPath } from '../middleware/upload.js';

// Haal de huidige instellingen op
const getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT site_title, site_subtitle, subtitle_font, subtitle_size, subtitle_color, accent_color, font, logo, logo_position, logo_margin_top, logo_margin_left, subtitle_margin_top, subtitle_margin_left, footer_text FROM settings WHERE id = 1'
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update de instellingen
const updateSettings = async (req, res) => {
  try {
    const {
      site_title,
      site_subtitle,
      subtitle_font,
      subtitle_size,
      subtitle_color,
      accent_color,
      font,
      logo_position,
      logo_margin_top,
      logo_margin_left,
      subtitle_margin_top,
      subtitle_margin_left,
      footer_text
    } = req.body;

    let query = `
      UPDATE settings 
      SET site_title = COALESCE($1, site_title),
          site_subtitle = COALESCE($2, site_subtitle),
          subtitle_font = COALESCE($3, subtitle_font),
          subtitle_size = COALESCE($4, subtitle_size),
          subtitle_color = COALESCE($5, subtitle_color),
          accent_color = COALESCE($6, accent_color),
          font = COALESCE($7, font),
          logo_position = COALESCE($8, logo_position),
          logo_margin_top = COALESCE($9, logo_margin_top),
          logo_margin_left = COALESCE($10, logo_margin_left),
          subtitle_margin_top = COALESCE($11, subtitle_margin_top),
          subtitle_margin_left = COALESCE($12, subtitle_margin_left),
          footer_text = COALESCE($13, footer_text)
    `;

    const values = [
      site_title,
      site_subtitle,
      subtitle_font,
      subtitle_size,
      subtitle_color,
      accent_color,
      font,
      logo_position,
      logo_margin_top,
      logo_margin_left,
      subtitle_margin_top,
      subtitle_margin_left,
      footer_text
    ];

    // Als er een logo is geüpload
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo;
      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(logoFile.name);
      const filepath = getUploadPath('branding', filename);
      
      // Verplaats het bestand
      await logoFile.mv(filepath);
      
      // Update de query om het nieuwe logo op te slaan
      query += ', logo = $14';
      values.push(filename);
    }

    query += ' WHERE id = 1 RETURNING *';

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getSettings, updateSettings }; 