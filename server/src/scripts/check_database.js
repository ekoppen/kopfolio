import { pool } from '../models/db.js';

export const checkDatabaseStructure = async () => {
  try {
    console.log('Controleren van database structuur...');
    
    // Controleer eerst of de settings tabel bestaat
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'settings'
      );
    `);
    
    const tableExists = tableResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('Settings tabel bestaat niet en wordt aangemaakt...');
      
      // Maak de settings tabel aan
      await pool.query(`
        CREATE TABLE settings (
          id SERIAL PRIMARY KEY,
          site_title VARCHAR(100) DEFAULT 'Kopfolio',
          site_subtitle VARCHAR(255) DEFAULT 'Portfolio Website Tool',
          accent_color VARCHAR(50) DEFAULT '#1a5637',
          font VARCHAR(100) DEFAULT 'Arial',
          subtitle_font VARCHAR(100) DEFAULT 'Arial',
          subtitle_size INTEGER DEFAULT 16,
          subtitle_color VARCHAR(50) DEFAULT '#000000',
          logo TEXT DEFAULT NULL,
          logo_position VARCHAR(50) DEFAULT 'left',
          logo_margin_top INTEGER DEFAULT 0,
          logo_margin_left INTEGER DEFAULT 0,
          subtitle_margin_top INTEGER DEFAULT 0,
          subtitle_margin_left INTEGER DEFAULT 0,
          footer_text TEXT DEFAULT '',
          sidebar_pattern TEXT DEFAULT NULL,
          pattern_opacity NUMERIC DEFAULT 0.5,
          pattern_scale NUMERIC DEFAULT 1,
          pattern_color VARCHAR(50) DEFAULT '#000000',
          logo_size INTEGER DEFAULT 60,
          logo_enabled BOOLEAN DEFAULT TRUE,
          subtitle_shadow_enabled BOOLEAN DEFAULT FALSE,
          subtitle_shadow_x INTEGER DEFAULT 0,
          subtitle_shadow_y INTEGER DEFAULT 0,
          subtitle_shadow_blur INTEGER DEFAULT 0,
          subtitle_shadow_color VARCHAR(50) DEFAULT '#000000',
          subtitle_shadow_opacity NUMERIC DEFAULT 0.5,
          menu_font_size INTEGER DEFAULT 16,
          content_font_size INTEGER DEFAULT 16,
          footer_font VARCHAR(100) DEFAULT 'Arial',
          footer_size INTEGER DEFAULT 14,
          footer_color VARCHAR(50) DEFAULT '#666666',
          logo_shadow_enabled BOOLEAN DEFAULT FALSE,
          logo_shadow_x INTEGER DEFAULT 0,
          logo_shadow_y INTEGER DEFAULT 0,
          logo_shadow_blur INTEGER DEFAULT 0,
          logo_shadow_color VARCHAR(50) DEFAULT '#000000',
          logo_shadow_opacity NUMERIC DEFAULT 0.5,
          background_color VARCHAR(50) DEFAULT NULL,
          background_opacity NUMERIC DEFAULT 1,
          use_dynamic_background_color BOOLEAN DEFAULT FALSE,
          favicon TEXT DEFAULT NULL
        );
      `);
      
      // Voeg een standaard record toe
      await pool.query(`
        INSERT INTO settings (id) VALUES (1);
      `);
      
      console.log('Settings tabel succesvol aangemaakt met standaard waarden');
    } else {
      console.log('Settings tabel bestaat al');
    }
    
    // Voer een query uit om alle benodigde kolommen te controleren en toe te voegen
    const result = await pool.query(`
      DO $$
      DECLARE
        column_added BOOLEAN := FALSE;
      BEGIN
        -- Logo enabled kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'logo_enabled'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN logo_enabled BOOLEAN DEFAULT TRUE;
          RAISE NOTICE 'Kolom logo_enabled toegevoegd aan settings tabel';
          column_added := TRUE;
        END IF;

        -- Background opacity kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'background_opacity'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN background_opacity NUMERIC DEFAULT 1;
          RAISE NOTICE 'Kolom background_opacity toegevoegd aan settings tabel';
          column_added := TRUE;
        END IF;

        -- Background color kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'background_color'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN background_color VARCHAR(50) DEFAULT NULL;
          RAISE NOTICE 'Kolom background_color toegevoegd aan settings tabel';
          column_added := TRUE;
        END IF;

        -- Use dynamic background color kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'use_dynamic_background_color'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN use_dynamic_background_color BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Kolom use_dynamic_background_color toegevoegd aan settings tabel';
          column_added := TRUE;
        END IF;

        -- Favicon kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'favicon'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN favicon TEXT;
          RAISE NOTICE 'Kolom favicon toegevoegd aan settings tabel';
          column_added := TRUE;
        END IF;

        -- Geef resultaat terug
        IF column_added THEN
          RAISE NOTICE 'Database structuur bijgewerkt met ontbrekende kolommen';
        ELSE
          RAISE NOTICE 'Alle benodigde kolommen zijn al aanwezig in de database';
        END IF;
      END $$;
    `);
    
    console.log('Database structuur gecontroleerd en bijgewerkt');
    
    // Controleer of de kolommen nu bestaan
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND column_name IN (
        'logo_enabled', 'background_opacity', 'background_color', 
        'use_dynamic_background_color', 'favicon'
      )
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    console.log('Bevestiging: De volgende kolommen bestaan nu in de database:', existingColumns);
    
    return true;
  } catch (error) {
    console.error('Fout bij controleren database structuur:', error);
    return false;
  }
};

// Voer de controle direct uit
console.log('Database check script wordt uitgevoerd...');
checkDatabaseStructure()
  .then(success => {
    if (success) {
      console.log('Database check succesvol afgerond');
    } else {
      console.error('Database check mislukt');
    }
  })
  .catch(error => {
    console.error('Onverwachte fout bij database check:', error);
  });

export default checkDatabaseStructure; 