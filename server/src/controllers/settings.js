import { pool } from '../models/db.js';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadDirs, getUploadPath } from '../middleware/upload.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import dotenv from 'dotenv';

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
      `SELECT site_title, site_subtitle, subtitle_font, subtitle_size, subtitle_color, 
              accent_color, font, logo, logo_position, logo_margin_top, logo_margin_left, 
              subtitle_margin_top, subtitle_margin_left, footer_text, sidebar_pattern, 
              pattern_opacity, pattern_scale, pattern_color, logo_size, logo_enabled,
              subtitle_shadow_enabled, subtitle_shadow_x, subtitle_shadow_y, 
              subtitle_shadow_blur, subtitle_shadow_color, subtitle_shadow_opacity,
              menu_font_size, content_font_size, footer_font, footer_size, footer_color,
              logo_shadow_enabled, logo_shadow_x, logo_shadow_y, logo_shadow_blur,
              logo_shadow_color, logo_shadow_opacity, background_color, background_opacity,
              use_dynamic_background_color
       FROM settings WHERE id = 1`
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
      logo_size,
      logo_enabled,
      subtitle_shadow_enabled,
      subtitle_shadow_x,
      subtitle_shadow_y,
      subtitle_shadow_blur,
      subtitle_shadow_color,
      subtitle_shadow_opacity,
      menu_font_size,
      content_font_size,
      footer_font,
      footer_size,
      footer_color,
      logo_shadow_enabled,
      logo_shadow_x,
      logo_shadow_y,
      logo_shadow_blur,
      logo_shadow_color,
      logo_shadow_opacity,
      background_color,
      background_opacity,
      use_dynamic_background_color
    } = req.body;

    console.log('Ontvangen instellingen in server controller:', req.body);
    console.log('use_dynamic_background_color waarde:', use_dynamic_background_color);

    // Parse numerieke waarden
    const parsedValues = {
      subtitle_size: subtitle_size !== undefined ? Number(subtitle_size) : undefined,
      logo_margin_top: logo_margin_top !== undefined ? Number(logo_margin_top) : undefined,
      logo_margin_left: logo_margin_left !== undefined ? Number(logo_margin_left) : undefined,
      subtitle_margin_top: subtitle_margin_top !== undefined ? Number(subtitle_margin_top) : undefined,
      subtitle_margin_left: subtitle_margin_left !== undefined ? Number(subtitle_margin_left) : undefined,
      pattern_opacity: pattern_opacity !== undefined ? Number(pattern_opacity) : undefined,
      pattern_scale: pattern_scale !== undefined ? Number(pattern_scale) : undefined,
      logo_size: logo_size !== undefined ? Number(logo_size) : undefined,
      menu_font_size: menu_font_size !== undefined ? Number(menu_font_size) : undefined,
      content_font_size: content_font_size !== undefined ? Number(content_font_size) : undefined,
      subtitle_shadow_x: subtitle_shadow_x !== undefined ? Number(subtitle_shadow_x) : undefined,
      subtitle_shadow_y: subtitle_shadow_y !== undefined ? Number(subtitle_shadow_y) : undefined,
      subtitle_shadow_blur: subtitle_shadow_blur !== undefined ? Number(subtitle_shadow_blur) : undefined,
      subtitle_shadow_opacity: subtitle_shadow_opacity !== undefined ? Number(subtitle_shadow_opacity) : undefined,
      footer_size: footer_size !== undefined ? Number(footer_size) : undefined,
      logo_shadow_x: logo_shadow_x !== undefined ? Number(logo_shadow_x) : undefined,
      logo_shadow_y: logo_shadow_y !== undefined ? Number(logo_shadow_y) : undefined,
      logo_shadow_blur: logo_shadow_blur !== undefined ? Number(logo_shadow_blur) : undefined,
      logo_shadow_opacity: logo_shadow_opacity !== undefined ? Number(logo_shadow_opacity) : undefined,
      background_opacity: background_opacity !== undefined ? Number(background_opacity) : undefined
    };

    // Bouw de query op met alleen de velden die zijn meegegeven
    let query = 'UPDATE settings SET';
    const values = [];
    let paramCount = 1;

    // Functie om een veld toe te voegen aan de query
    const addField = (field, value, parser = null) => {
      if (value !== undefined) {
        if (paramCount > 1) query += ',';
        query += ` ${field} = $${paramCount}`;
        values.push(parser ? parser(value) : value);
        paramCount++;
        return true;
      }
      return false;
    };

    // Voeg alle velden toe aan de query
    addField('site_title', site_title);
    addField('site_subtitle', site_subtitle);
    addField('subtitle_font', subtitle_font);
    addField('subtitle_size', parsedValues.subtitle_size);
    addField('subtitle_color', subtitle_color);
    addField('accent_color', accent_color);
    addField('font', font);
    addField('logo_position', logo_position);
    addField('logo_margin_top', parsedValues.logo_margin_top);
    addField('logo_margin_left', parsedValues.logo_margin_left);
    addField('subtitle_margin_top', parsedValues.subtitle_margin_top);
    addField('subtitle_margin_left', parsedValues.subtitle_margin_left);
    addField('footer_text', footer_text);
    addField('sidebar_pattern', sidebar_pattern);
    addField('pattern_opacity', parsedValues.pattern_opacity);
    addField('pattern_scale', parsedValues.pattern_scale);
    addField('pattern_color', pattern_color);
    addField('logo_size', parsedValues.logo_size);
    addField('logo_enabled', logo_enabled);
    addField('subtitle_shadow_enabled', subtitle_shadow_enabled);
    addField('subtitle_shadow_x', parsedValues.subtitle_shadow_x);
    addField('subtitle_shadow_y', parsedValues.subtitle_shadow_y);
    addField('subtitle_shadow_blur', parsedValues.subtitle_shadow_blur);
    addField('subtitle_shadow_color', subtitle_shadow_color);
    addField('subtitle_shadow_opacity', parsedValues.subtitle_shadow_opacity);
    addField('menu_font_size', parsedValues.menu_font_size);
    addField('content_font_size', parsedValues.content_font_size);
    addField('footer_font', footer_font);
    addField('footer_size', parsedValues.footer_size);
    addField('footer_color', footer_color);
    addField('logo_shadow_enabled', logo_shadow_enabled);
    addField('logo_shadow_x', parsedValues.logo_shadow_x);
    addField('logo_shadow_y', parsedValues.logo_shadow_y);
    addField('logo_shadow_blur', parsedValues.logo_shadow_blur);
    addField('logo_shadow_color', logo_shadow_color);
    addField('logo_shadow_opacity', parsedValues.logo_shadow_opacity);
    addField('background_color', background_color);
    addField('background_opacity', parsedValues.background_opacity);
    addField('use_dynamic_background_color', use_dynamic_background_color);

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
        query += ', logo = $' + paramCount;
        values.push(filename);
        paramCount++;

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(logoFile.mimetype)) {
      return res.status(400).json({ error: 'Ongeldig bestandstype. Alleen JPG, PNG, GIF en SVG zijn toegestaan.' });
    }

    // Genereer unieke bestandsnaam
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(logoFile.name);
    const uploadDir = getUploadPath('branding');
    
    if (!uploadDir) {
      throw new Error('Upload directory niet gevonden');
    }

    // Zorg dat de upload directory bestaat
    await fs.mkdir(uploadDir, { recursive: true });
    
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
    try {
      await fs.access(fontsDir);
    } catch {
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

// Upload een font bestand
export const uploadFont = async (req, res) => {
  try {
    if (!req.files || !req.files.font) {
      return res.status(400).json({ error: 'Geen font bestand geüpload' });
    }

    const fontFile = req.files.font;
    const allowedTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', 'application/font-woff2'];
    
    if (!allowedTypes.includes(fontFile.mimetype)) {
      return res.status(400).json({ 
        error: 'Ongeldig bestandstype. Alleen TTF, OTF, WOFF en WOFF2 zijn toegestaan.' 
      });
    }

    // Genereer een veilige bestandsnaam
    const filename = fontFile.name.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
    const uploadPath = getUploadPath('fonts', filename);

    if (!uploadPath) {
      return res.status(500).json({ error: 'Fout bij bepalen upload pad' });
    }

    // Verplaats het bestand
    await fontFile.mv(uploadPath);

    // Bepaal het font type op basis van de extensie
    const ext = path.extname(filename).slice(1);
    const fontName = path.basename(filename, path.extname(filename))
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    res.json({
      success: true,
      font: {
        name: fontName,
        value: fontName,
        file: filename,
        type: ext
      }
    });
  } catch (error) {
    console.error('Fout bij uploaden font:', error);
    res.status(500).json({ error: 'Fout bij uploaden font' });
  }
};

// Haal e-mail instellingen op
export const getEmailSettings = async (req, res) => {
  try {
    res.json({
      email_user: process.env.EMAIL_USER || '',
      email_pass: process.env.EMAIL_PASS || '',
      contact_email: process.env.CONTACT_EMAIL || ''
    });
  } catch (error) {
    console.error('Fout bij ophalen e-mail instellingen:', error);
    res.status(500).json({ error: 'Fout bij ophalen e-mail instellingen' });
  }
};

// Update e-mail instellingen
export const updateEmailSettings = async (req, res) => {
  try {
    const { email_user, email_pass, contact_email } = req.body;

    // Update .env bestand
    const envPath = '.env';
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    const updatedContent = envContent
      .replace(/EMAIL_USER=.*/, `EMAIL_USER=${email_user}`)
      .replace(/EMAIL_PASS=.*/, `EMAIL_PASS=${email_pass}`)
      .replace(/CONTACT_EMAIL=.*/, `CONTACT_EMAIL=${contact_email}`);

    await fs.writeFile(envPath, updatedContent);

    // Update process.env
    process.env.EMAIL_USER = email_user;
    process.env.EMAIL_PASS = email_pass;
    process.env.CONTACT_EMAIL = contact_email;

    res.json({ success: true });
  } catch (error) {
    console.error('Fout bij updaten e-mail instellingen:', error);
    res.status(500).json({ error: 'Fout bij updaten e-mail instellingen' });
  }
};

// Test e-mail instellingen
export const testEmailSettings = async (req, res) => {
  try {
    // Stuur een test e-mail
    await sendWelcomeEmail({
      email: process.env.CONTACT_EMAIL,
      full_name: 'Test Gebruiker',
      username: 'test',
      role: 'admin'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Fout bij testen e-mail instellingen:', error);
    res.status(500).json({ error: 'Fout bij testen e-mail instellingen' });
  }
}; 