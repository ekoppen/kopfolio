import { pool } from '../models/db.js';
import path from 'path';
import { promises as fs } from 'fs';
import { uploadDirs, getUploadPath } from '../middleware/upload.js';

// Haal de huidige instellingen op
const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT site_title, accent_color, font, logo FROM settings LIMIT 1');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fout bij ophalen instellingen:', error);
    res.status(500).json({ error: 'Fout bij ophalen instellingen' });
  }
};

// Update de instellingen
const updateSettings = async (req, res) => {
  const { site_title, accent_color, font } = req.body;
  let logo = null;

  try {
    // Handle logo upload if present
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo;
      
      // Valideer bestandstype
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
      const fileExt = path.extname(logoFile.name).toLowerCase();
      if (!allowedTypes.includes(fileExt)) {
        return res.status(400).json({ error: 'Ongeldig bestandstype. Toegestaan zijn: ' + allowedTypes.join(', ') });
      }

      const fileName = `logo_${Date.now()}${fileExt}`;
      const uploadPath = getUploadPath('branding', fileName);

      // Remove old logo if exists
      const oldResult = await pool.query('SELECT logo FROM settings LIMIT 1');
      if (oldResult.rows[0].logo) {
        const oldPath = getUploadPath('branding', oldResult.rows[0].logo);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.error('Fout bij verwijderen oude logo:', err);
          // Ga door met de update, ook al is het verwijderen mislukt
        }
      }

      try {
        // Save new logo
        await logoFile.mv(uploadPath);
        logo = fileName;
      } catch (error) {
        console.error('Fout bij opslaan logo:', error);
        return res.status(500).json({ error: 'Fout bij opslaan logo bestand' });
      }
    }

    // Update settings
    const query = `
      UPDATE settings 
      SET site_title = $1, 
          accent_color = $2, 
          font = $3,
          logo = COALESCE($4, logo),
          updated_at = CURRENT_TIMESTAMP
      RETURNING site_title, accent_color, font, logo
    `;
    
    const result = await pool.query(query, [site_title, accent_color, font, logo]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fout bij updaten instellingen:', error);
    res.status(500).json({ error: 'Fout bij updaten instellingen' });
  }
};

export { getSettings, updateSettings }; 