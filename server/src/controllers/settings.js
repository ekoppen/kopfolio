import { pool } from '../models/db.js';
import path from 'path';
import { promises as fs } from 'fs';
import fs_sync from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadDirs, getUploadPath } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Haal beschikbare patronen op
export const getPatterns = async (req, res) => {
  try {
    const patternsDir = path.join(__dirname, '../../public/patterns');
    const files = await fs.readdir(patternsDir);
    const patterns = files
      .filter(file => /\.(svg|png|jpe?g|webp)$/i.test(file))
      .map(file => {
        const ext = path.extname(file).toLowerCase();
        const name = file.replace(/\.[^/.]+$/, ''); // Verwijder extensie voor de naam
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '), // Maak naam leesbaar
          value: file,
          preview: `/patterns/${file}`,
          type: ext.slice(1), // svg, png, jpg/jpeg, of webp
          isRaster: ['png', 'jpg', 'jpeg', 'webp'].includes(ext.slice(1)) // Helper voor raster vs vector
        };
      });
    
    res.json(patterns);
  } catch (error) {
    console.error('Error getting patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Haal de huidige instellingen op
export const getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT site_title, site_subtitle, subtitle_font, subtitle_size, subtitle_color, accent_color, font, logo, logo_position, logo_margin_top, logo_margin_left, subtitle_margin_top, subtitle_margin_left, footer_text, sidebar_pattern, pattern_opacity, pattern_scale, pattern_color, logo_size FROM settings WHERE id = 1'
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update de instellingen
export const updateSettings = async (req, res) => {
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
      footer_text,
      sidebar_pattern,
      pattern_opacity,
      pattern_scale,
      pattern_color,
      logo_size
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
          footer_text = COALESCE($13, footer_text),
          sidebar_pattern = COALESCE($14, sidebar_pattern),
          pattern_opacity = COALESCE($15, pattern_opacity),
          pattern_scale = COALESCE($16, pattern_scale),
          pattern_color = COALESCE($17, pattern_color),
          logo_size = COALESCE($18, logo_size)
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
      footer_text,
      sidebar_pattern,
      pattern_opacity,
      pattern_scale,
      pattern_color,
      logo_size
    ];

    // Als er een logo is geüpload
    if (req.files && req.files.logo) {
      try {
        const logoFile = req.files.logo;
        
        // Valideer bestandsgrootte
        if (logoFile.size > 10 * 1024 * 1024) {
          return res.status(400).json({ error: 'Logo bestand is te groot (max 10MB)' });
        }

        // Valideer bestandstype
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(logoFile.mimetype)) {
          return res.status(400).json({ error: 'Ongeldig bestandstype. Alleen JPG, PNG en GIF zijn toegestaan.' });
        }

        // Genereer unieke bestandsnaam
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(logoFile.name);
        const uploadDir = getUploadPath('branding');
        const filepath = path.join(uploadDir, filename);

        // Zorg dat de upload directory bestaat
        await fs.mkdir(uploadDir, { recursive: true });
        
        // Verplaats het bestand
        await logoFile.mv(filepath);
        
        // Update de query om het nieuwe logo op te slaan
        query += ', logo = $19';
        values.push(filename);

        // Verwijder het oude logo bestand als het bestaat
        const oldResult = await pool.query('SELECT logo FROM settings WHERE id = 1');
        const oldLogo = oldResult.rows[0]?.logo;
        if (oldLogo) {
          const oldPath = path.join(uploadDir, oldLogo);
          try {
            await fs.unlink(oldPath);
          } catch (err) {
            console.error('Error removing old logo:', err);
            // Ga door met de update, zelfs als het oude bestand niet verwijderd kon worden
          }
        }
      } catch (error) {
        console.error('Error handling logo upload:', error);
        return res.status(500).json({ error: 'Fout bij uploaden van logo' });
      }
    }

    query += ' WHERE id = 1 RETURNING *';

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLogo = async (req, res) => {
  try {
    if (!req.files || !req.files.logo) {
      return res.status(400).json({ error: 'Geen logo bestand ontvangen' });
    }

    const logoFile = req.files.logo;
    
    // Valideer bestandsgrootte
    if (logoFile.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Logo bestand is te groot (max 10MB)' });
    }

    // Valideer bestandstype
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(logoFile.mimetype)) {
      return res.status(400).json({ error: 'Ongeldig bestandstype. Alleen JPG, PNG en GIF zijn toegestaan.' });
    }

    // Genereer unieke bestandsnaam
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(logoFile.name);
    const uploadDir = getUploadPath('branding');
    
    if (!uploadDir) {
      throw new Error('Upload directory niet gevonden');
    }
    
    const filepath = path.join(uploadDir, filename);

    // Verplaats het bestand
    await logoFile.mv(filepath);

    // Verwijder het oude logo bestand als het bestaat
    const oldResult = await pool.query('SELECT logo FROM settings WHERE id = 1');
    const oldLogo = oldResult.rows[0]?.logo;
    if (oldLogo) {
      const oldPath = path.join(uploadDir, oldLogo);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.error('Error removing old logo:', err);
        // Ga door met de update, zelfs als het oude bestand niet verwijderd kon worden
      }
    }

    // Update alleen het logo veld in de database
    const query = 'UPDATE settings SET logo = $1 WHERE id = 1 RETURNING logo';
    const result = await pool.query(query, [filename]);
    
    res.json({ logo: result.rows[0].logo });
  } catch (error) {
    console.error('Error handling logo upload:', error);
    res.status(500).json({ error: 'Fout bij uploaden van logo' });
  }
};

// Haal beschikbare fonts op
export const getFonts = async (req, res) => {
  try {
    const fontsDir = path.join(__dirname, '../../public/fonts');
    console.log('Zoeken naar fonts in:', fontsDir);
    
    // Maak de fonts directory aan als deze nog niet bestaat
    if (!fs_sync.existsSync(fontsDir)) {
      await fs.mkdir(fontsDir, { recursive: true });
    }

    const files = await fs.readdir(fontsDir);
    console.log('Gevonden font bestanden:', files);

    const fonts = files
      .filter(file => /\.(woff2?|ttf|otf)$/i.test(file))
      .map(file => {
        const ext = path.extname(file).toLowerCase();
        const name = file.replace(/\.[^/.]+$/, ''); // Verwijder extensie voor de naam
        const font = {
          name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '), // Maak naam leesbaar
          value: name,
          file: file,
          type: ext.slice(1) // woff, woff2, ttf, of otf
        };
        console.log('Font object aangemaakt:', font);
        return font;
      });
    
    // Voeg standaard system fonts toe
    const systemFonts = [
      { name: 'System Default', value: 'system-ui', type: 'system' },
      { name: 'Arial', value: 'Arial', type: 'system' },
      { name: 'Helvetica', value: 'Helvetica', type: 'system' },
      { name: 'Verdana', value: 'Verdana', type: 'system' },
      { name: 'Georgia', value: 'Georgia', type: 'system' },
      { name: 'Times New Roman', value: 'Times New Roman', type: 'system' }
    ];

    const allFonts = [...systemFonts, ...fonts];
    console.log('Alle fonts die worden teruggestuurd:', allFonts);
    
    res.json(allFonts);
  } catch (error) {
    console.error('Error getting fonts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 