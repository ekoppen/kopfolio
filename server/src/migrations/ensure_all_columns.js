export default async function(pool) {
  console.log('Ensuring all required columns exist in the settings table...');
  
  try {
    await pool.query(`
      DO $$
      BEGIN
        -- Logo size kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'logo_size'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN logo_size INTEGER DEFAULT 60;

          UPDATE settings 
          SET logo_size = 60
          WHERE id = 1;
        END IF;

        -- Logo enabled kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'logo_enabled'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN logo_enabled BOOLEAN DEFAULT TRUE;

          UPDATE settings 
          SET logo_enabled = TRUE
          WHERE id = 1;
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

          UPDATE settings 
          SET background_opacity = 1
          WHERE id = 1;
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

          UPDATE settings 
          SET use_dynamic_background_color = FALSE
          WHERE id = 1;
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
        END IF;

        -- Controleer of de font kolommen correcte waarden hebben
        UPDATE settings 
        SET font = 'Arial' 
        WHERE font IS NULL OR font = 'system-ui';

        UPDATE settings 
        SET subtitle_font = 'Arial' 
        WHERE subtitle_font IS NULL OR subtitle_font = 'system-ui';

        UPDATE settings 
        SET footer_font = 'Arial' 
        WHERE footer_font IS NULL OR footer_font = 'system-ui';
      END $$;
    `);
    
    console.log('All required columns have been ensured.');
    return true;
  } catch (error) {
    console.error('Error ensuring columns:', error);
    return false;
  }
} 