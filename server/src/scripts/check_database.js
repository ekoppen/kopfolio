import { pool } from '../models/db.js';

export const checkDatabaseStructure = async () => {
  try {
    console.log('Controleren van database structuur...');
    
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