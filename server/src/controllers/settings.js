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
    // Stap 1: Controleer welke kolommen bestaan in de settings tabel
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings'
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    
    // Stap 2: Bouw een dynamische query op basis van bestaande kolommen
    const selectColumns = ['id'];
    
    // Lijst van alle mogelijke kolommen met hun standaardwaarden
    const allColumns = {
      site_title: "'Kopfolio'",
      site_subtitle: "'Portfolio Website Tool'",
      accent_color: "'#1a5637'",
      font: "'Arial'",
      subtitle_font: "'Arial'",
      subtitle_size: "16",
      subtitle_color: "'#000000'",
      logo: "NULL",
      logo_position: "'left'",
      logo_margin_top: "0",
      logo_margin_left: "0",
      subtitle_margin_top: "0",
      subtitle_margin_left: "0",
      footer_text: "''",
      sidebar_pattern: "NULL",
      pattern_opacity: "0.5",
      pattern_scale: "1",
      pattern_color: "'#000000'",
      logo_size: "60",
      logo_enabled: "TRUE",
      subtitle_shadow_enabled: "FALSE",
      subtitle_shadow_x: "0",
      subtitle_shadow_y: "0",
      subtitle_shadow_blur: "0",
      subtitle_shadow_color: "'#000000'",
      subtitle_shadow_opacity: "0.5",
      menu_font_size: "16",
      content_font_size: "16",
      footer_font: "'Arial'",
      footer_size: "14",
      footer_color: "'#666666'",
      logo_shadow_enabled: "FALSE",
      logo_shadow_x: "0",
      logo_shadow_y: "0",
      logo_shadow_blur: "0",
      logo_shadow_color: "'#000000'",
      logo_shadow_opacity: "0.5",
      background_color: "NULL",
      background_opacity: "1",
      use_dynamic_background_color: "FALSE",
      favicon: "NULL"
    };
    
    // Voeg elke kolom toe aan de query als deze bestaat, anders gebruik de standaardwaarde
    for (const [column, defaultValue] of Object.entries(allColumns)) {
      if (existingColumns.includes(column)) {
        selectColumns.push(column);
      } else {
        selectColumns.push(`${defaultValue} as ${column}`);
      }
    }
    
    // Stap 3: Voer de dynamische query uit
    const query = `
      SELECT ${selectColumns.join(', ')}
      FROM settings 
      WHERE id = 1
    `;
    
    console.log('Dynamische query:', query);
    
    const result = await pool.query(query);
    
    // Stap 4: Stuur het resultaat terug
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting settings:', error);
    
    // Als er een fout optreedt, stuur dan standaard instellingen terug
    res.json({
      site_title: 'Kopfolio',
      site_subtitle: 'Portfolio Website Tool',
      accent_color: '#1a5637',
      font: 'Arial',
      subtitle_font: 'Arial',
      subtitle_size: 16,
      subtitle_color: '#000000',
      logo: null,
      logo_position: 'left',
      logo_margin_top: 0,
      logo_margin_left: 0,
      subtitle_margin_top: 0,
      subtitle_margin_left: 0,
      footer_text: '',
      sidebar_pattern: null,
      pattern_opacity: 0.5,
      pattern_scale: 1,
      pattern_color: '#000000',
      logo_size: 60,
      logo_enabled: true,
      subtitle_shadow_enabled: false,
      subtitle_shadow_x: 0,
      subtitle_shadow_y: 0,
      subtitle_shadow_blur: 0,
      subtitle_shadow_color: '#000000',
      subtitle_shadow_opacity: 0.5,
      menu_font_size: 16,
      content_font_size: 16,
      footer_font: 'Arial',
      footer_size: 14,
      footer_color: '#666666',
      logo_shadow_enabled: false,
      logo_shadow_x: 0,
      logo_shadow_y: 0,
      logo_shadow_blur: 0,
      logo_shadow_color: '#000000',
      logo_shadow_opacity: 0.5,
      background_color: null,
      background_opacity: 1,
      use_dynamic_background_color: false,
      favicon: null
    });
  }
};

// Update de instellingen
export const updateSettings = async (req, res) => {
  try {
    // Haal alle instellingen uit de request body
    const settings = req.body;
    console.log('Ontvangen instellingen in server controller:', settings);

    // Stap 1: Controleer welke kolommen bestaan in de settings tabel
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings'
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    console.log('Bestaande kolommen in settings tabel:', existingColumns);
    
    // Stap 1.5: Voeg ontbrekende kolommen toe indien nodig
    const requiredColumns = [
      { name: 'logo_enabled', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'background_opacity', type: 'NUMERIC', default: '1' },
      { name: 'background_color', type: 'VARCHAR(50)', default: 'NULL' },
      { name: 'use_dynamic_background_color', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'favicon', type: 'TEXT', default: 'NULL' }
    ];
    
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Kolom ${column.name} ontbreekt en wordt toegevoegd...`);
        try {
          await pool.query(`
            ALTER TABLE settings 
            ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}
          `);
          console.log(`Kolom ${column.name} succesvol toegevoegd`);
          existingColumns.push(column.name);
        } catch (error) {
          console.error(`Fout bij toevoegen van kolom ${column.name}:`, error);
        }
      }
    }
    
    // Stap 2: Bouw een dynamische query op basis van bestaande kolommen
    let query = 'UPDATE settings SET';
    const values = [];
    let paramCount = 1;

    // Functie om een veld toe te voegen aan de query als de kolom bestaat
    const addField = (field, value) => {
      if (value !== undefined && existingColumns.includes(field)) {
        if (paramCount > 1) query += ',';
        query += ` ${field} = $${paramCount}`;
        
        // Parse numerieke waarden
        if (typeof value === 'string' && !isNaN(Number(value)) && 
            ['subtitle_size', 'logo_margin_top', 'logo_margin_left', 'subtitle_margin_top', 
             'subtitle_margin_left', 'pattern_opacity', 'pattern_scale', 'logo_size', 
             'menu_font_size', 'content_font_size', 'subtitle_shadow_x', 'subtitle_shadow_y', 
             'subtitle_shadow_blur', 'subtitle_shadow_opacity', 'footer_size', 'logo_shadow_x', 
             'logo_shadow_y', 'logo_shadow_blur', 'logo_shadow_opacity', 'background_opacity'
            ].includes(field)) {
          values.push(Number(value));
        } else {
          values.push(value);
        }
        
        paramCount++;
        return true;
      }
      return false;
    };

    // Voeg alle velden toe aan de query als ze bestaan in de database
    for (const [field, value] of Object.entries(settings)) {
      addField(field, value);
    }

    // Als er geen velden zijn om bij te werken, stuur dan de huidige instellingen terug
    if (paramCount === 1) {
      const currentSettings = await pool.query(`SELECT * FROM settings WHERE id = 1`);
      return res.json(currentSettings.rows[0]);
    }

    // Als er een logo is geüpload
    if (req.files && req.files.logo && existingColumns.includes('logo')) {
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
        if (paramCount > 1) query += ',';
        query += ` logo = $${paramCount}`;
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
    console.log('Dynamische update query:', query);
    console.log('Query parameters:', values);

    try {
      const result = await pool.query(query, values);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error executing update query:', error);
      
      // Als er een fout optreedt, probeer dan de huidige instellingen op te halen
      try {
        const currentSettings = await pool.query(`SELECT * FROM settings WHERE id = 1`);
        res.json(currentSettings.rows[0]);
      } catch (innerError) {
        console.error('Error getting current settings:', innerError);
        res.status(500).json({ error: 'Fout bij bijwerken instellingen' });
      }
    }
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

    // Controleer eerst of de logo kolom bestaat
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND column_name IN ('logo', 'logo_enabled')
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    
    // Voeg ontbrekende kolommen toe indien nodig
    if (!existingColumns.includes('logo')) {
      console.log('Logo kolom ontbreekt en wordt toegevoegd...');
      try {
        await pool.query(`
          ALTER TABLE settings 
          ADD COLUMN logo TEXT DEFAULT NULL
        `);
        console.log('Kolom logo succesvol toegevoegd');
        existingColumns.push('logo');
      } catch (error) {
        console.error('Fout bij toevoegen van kolom logo:', error);
        return res.status(500).json({ 
          error: 'Logo kolom kon niet worden toegevoegd aan de database',
          logo: null
        });
      }
    }
    
    if (!existingColumns.includes('logo_enabled')) {
      console.log('Logo_enabled kolom ontbreekt en wordt toegevoegd...');
      try {
        await pool.query(`
          ALTER TABLE settings 
          ADD COLUMN logo_enabled BOOLEAN DEFAULT TRUE
        `);
        console.log('Kolom logo_enabled succesvol toegevoegd');
        existingColumns.push('logo_enabled');
      } catch (error) {
        console.error('Fout bij toevoegen van kolom logo_enabled:', error);
        // Ga door, zelfs als deze kolom niet kan worden toegevoegd
      }
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
    const filepath = path.join(uploadDir, filename);

    // Zorg dat de upload directory bestaat
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Verplaats het bestand
    await logoFile.mv(filepath);

    try {
      // Haal het oude logo op
      const oldResult = await pool.query('SELECT logo FROM settings WHERE id = 1');
      const oldLogo = oldResult.rows[0]?.logo;
      
      // Update de database met het nieuwe logo en zet logo_enabled op true
      let query = 'UPDATE settings SET logo = $1';
      const values = [filename];
      
      // Voeg logo_enabled toe aan de query als de kolom bestaat
      if (existingColumns.includes('logo_enabled')) {
        query += ', logo_enabled = TRUE';
      }
      
      query += ' WHERE id = 1 RETURNING *';
      
      const result = await pool.query(query, values);
      
      // Verwijder het oude logo bestand als het bestaat
      if (oldLogo) {
        const oldPath = path.join(uploadDir, oldLogo);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.error('Error removing old logo:', err);
          // Ga door, zelfs als het oude bestand niet verwijderd kon worden
        }
      }
      
      res.json({
        logo: filename,
        logo_enabled: true
      });
    } catch (error) {
      console.error('Error updating logo in database:', error);
      res.status(500).json({ error: 'Fout bij bijwerken logo in database' });
    }
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Voeg een nieuwe functie toe voor het uploaden van een favicon
export const updateFavicon = async (req, res) => {
  try {
    if (!req.files || !req.files.favicon) {
      return res.status(400).json({ error: 'Geen favicon bestand ontvangen' });
    }

    // Controleer eerst of de favicon kolom bestaat
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND column_name = 'favicon'
    `);
    
    // Voeg de favicon kolom toe als deze niet bestaat
    if (columnsResult.rows.length === 0) {
      console.log('Favicon kolom ontbreekt en wordt toegevoegd...');
      try {
        await pool.query(`
          ALTER TABLE settings 
          ADD COLUMN favicon TEXT DEFAULT NULL
        `);
        console.log('Kolom favicon succesvol toegevoegd');
      } catch (error) {
        console.error('Fout bij toevoegen van kolom favicon:', error);
        return res.status(500).json({ 
          error: 'Favicon kolom kon niet worden toegevoegd aan de database',
          favicon: null
        });
      }
    }

    const faviconFile = req.files.favicon;
    
    // Valideer bestandsgrootte
    if (faviconFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Favicon bestand is te groot (max 5MB)' });
    }

    // Valideer bestandstype
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(faviconFile.mimetype)) {
      return res.status(400).json({ error: 'Ongeldig bestandstype. Alleen JPG, PNG, GIF en ICO zijn toegestaan.' });
    }

    // Genereer unieke bestandsnaam
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(faviconFile.name);
    const uploadDir = getUploadPath('branding');
    const filepath = path.join(uploadDir, filename);

    // Zorg dat de upload directory bestaat
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Verplaats het bestand
    await faviconFile.mv(filepath);

    try {
      // Haal het oude favicon op
      const oldResult = await pool.query('SELECT favicon FROM settings WHERE id = 1');
      const oldFavicon = oldResult.rows[0]?.favicon;
      
      // Update de database met het nieuwe favicon
      const query = 'UPDATE settings SET favicon = $1 WHERE id = 1 RETURNING favicon';
      const result = await pool.query(query, [filename]);
      
      // Verwijder het oude favicon bestand als het bestaat
      if (oldFavicon) {
        const oldPath = path.join(uploadDir, oldFavicon);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.error('Error removing old favicon:', err);
          // Ga door, zelfs als het oude bestand niet verwijderd kon worden
        }
      }
      
      res.json({ favicon: result.rows[0].favicon });
    } catch (error) {
      console.error('Error updating favicon in database:', error);
      res.status(500).json({ error: 'Fout bij bijwerken favicon in database' });
    }
  } catch (error) {
    console.error('Error updating favicon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Functie voor het uploaden van een favicon via base64
export const updateFaviconBase64 = async (req, res) => {
  try {
    const { base64Data } = req.body;
    
    if (!base64Data) {
      return res.status(400).json({ error: 'Geen base64 data ontvangen' });
    }

    // Controleer eerst of de favicon kolom bestaat
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND column_name = 'favicon'
    `);
    
    // Voeg de favicon kolom toe als deze niet bestaat
    if (columnsResult.rows.length === 0) {
      console.log('Favicon kolom ontbreekt en wordt toegevoegd...');
      try {
        await pool.query(`
          ALTER TABLE settings 
          ADD COLUMN favicon TEXT DEFAULT NULL
        `);
        console.log('Kolom favicon succesvol toegevoegd');
      } catch (error) {
        console.error('Fout bij toevoegen van kolom favicon:', error);
        return res.status(500).json({ 
          error: 'Favicon kolom kon niet worden toegevoegd aan de database',
          favicon: null
        });
      }
    }

    // Valideer de base64 data
    if (!base64Data.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Ongeldige base64 data. Alleen afbeeldingsbestanden zijn toegestaan.' });
    }

    // Extraheer het MIME type en de data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Ongeldige base64 data formaat' });
    }
    
    const mimeType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, 'base64');
    
    // Valideer bestandsgrootte
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Favicon bestand is te groot (max 5MB)' });
    }

    // Bepaal de extensie op basis van het MIME type
    let extension = '.png';
    if (mimeType === 'image/jpeg') extension = '.jpg';
    else if (mimeType === 'image/gif') extension = '.gif';
    else if (mimeType === 'image/x-icon' || mimeType === 'image/vnd.microsoft.icon') extension = '.ico';

    // Genereer unieke bestandsnaam
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + extension;
    const uploadDir = getUploadPath('branding');
    const filepath = path.join(uploadDir, filename);

    // Zorg dat de upload directory bestaat
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Schrijf het bestand
    await fs.writeFile(filepath, buffer);

    try {
      // Haal het oude favicon op
      const oldResult = await pool.query('SELECT favicon FROM settings WHERE id = 1');
      const oldFavicon = oldResult.rows[0]?.favicon;
      
      // Update de database met het nieuwe favicon
      const query = 'UPDATE settings SET favicon = $1 WHERE id = 1 RETURNING favicon';
      const result = await pool.query(query, [filename]);
      
      // Verwijder het oude favicon bestand als het bestaat
      if (oldFavicon) {
        const oldPath = path.join(uploadDir, oldFavicon);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.error('Error removing old favicon:', err);
          // Ga door, zelfs als het oude bestand niet verwijderd kon worden
        }
      }
      
      res.json({ favicon: result.rows[0].favicon });
    } catch (error) {
      console.error('Error updating favicon in database:', error);
      res.status(500).json({ error: 'Fout bij bijwerken favicon in database' });
    }
  } catch (error) {
    console.error('Error updating favicon with base64:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 