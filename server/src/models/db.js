import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

export async function initDb() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Maak de migrations tabel aan als deze nog niet bestaat
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Definieer de migraties in de juiste volgorde
    const migrations = [
      '001_create_migrations.sql',
      '003_create_user_role.sql',  // Eerst user_role aanmaken
      '004_create_users.sql',      // Dan users
      '001_create_pages.sql',      // Dan pages
      '002_create_settings.sql',   // Dan settings
      '003_create_default_settings.sql',
      '023_add_user_roles.sql',
      '005_create_albums.sql',
      '006_create_photos.sql',
      '007_create_photos_albums.sql',
      '008_create_home_album.sql',
      '009_create_sample_photos.sql',
      '010_add_menu_fields.sql',
      '011_add_sidebar_pattern.sql',
      '012_add_pattern_opacity.sql',
      '013_add_pattern_color.sql',
      '013_add_pattern_scale.sql',
      '014_add_logo_size.sql',
      '015_add_subtitle_shadow.sql',
      '016_add_page_parent.sql',
      '017_add_parent_only.sql',
      '018_add_font_sizes.sql',
      '019_add_fullscreen_slideshow.sql',
      '020_add_footer_settings.sql',
      '021_add_logo_shadow.sql',
      '022_add_sub_order.sql',
      '024_add_exif_data.sql',
      '025_add_background_color.sql',
      'add_logo_enabled.sql',
      'add_sub_order_column.sql',
      'add_favicon_field.js',
      'ensure_all_columns.js',
      '026_ensure_all_columns.sql'
    ];

    // Controleer welke migraties al zijn uitgevoerd
    const result = await client.query('SELECT name FROM migrations');
    const executedMigrations = result.rows.map(row => row.name);

    // Voer alleen nog niet uitgevoerde migraties uit
    for (const migration of migrations) {
      if (!executedMigrations.includes(migration)) {
        try {
          const migrationPath = path.join(__dirname, '..', 'db', 'migrations', migration);
          const migrationContent = await fs.readFile(migrationPath, 'utf8');
          
          await client.query(migrationContent);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration]);
          console.log(`Migratie ${migration} succesvol uitgevoerd`);
        } catch (error) {
          console.error(`Fout bij uitvoeren migratie ${migration}:`, error);
          throw error;
        }
      } else {
        console.log(`Migratie ${migration} is al uitgevoerd`);
      }
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fout bij initialiseren database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Functie om de database structuur te controleren en bij te werken
const initializeDatabase = async () => {
  try {
    // Controleer en voeg alle benodigde kolommen toe
    const checkColumnsQuery = `
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

        -- Created_at kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'created_at'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;

        -- Updated_at kolom
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'settings' 
          AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE settings
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
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
    `;

    await pool.query(checkColumnsQuery);
    console.log('Database structuur gecontroleerd en bijgewerkt');
  } catch (error) {
    console.error('Fout bij controleren database structuur:', error);
  }
};

// Voer de initialisatie uit bij het opstarten
initializeDatabase();

export { pool }; 