import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: 5432
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users tabel
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Maak standaard admin gebruiker aan als deze nog niet bestaat
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await client.query(`
      INSERT INTO users (username, password)
      SELECT 'admin', $1
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
    `, [hashedPassword]);

    // Albums tabel
    await client.query(`
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        is_home BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create function to enforce single home album
      CREATE OR REPLACE FUNCTION enforce_single_home_album()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.is_home = true THEN
          UPDATE albums SET is_home = false WHERE id != NEW.id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create trigger
      DROP TRIGGER IF EXISTS ensure_single_home_album ON albums;
      CREATE TRIGGER ensure_single_home_album
        BEFORE INSERT OR UPDATE ON albums
        FOR EACH ROW
        EXECUTE FUNCTION enforce_single_home_album();
    `);

    // Photos tabel
    await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        thumbnail_filename VARCHAR(255),
        title VARCHAR(100),
        description TEXT,
        exif_data JSONB,
        album_id INTEGER REFERENCES albums(id),
        hash VARCHAR(64),
        size BIGINT,
        original_date TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pages tabel
    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        content JSONB,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create settings table with all columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        site_title VARCHAR(100) NOT NULL DEFAULT 'Kopfolio',
        accent_color VARCHAR(7) NOT NULL DEFAULT '#2196f3',
        font VARCHAR(50) NOT NULL DEFAULT 'Inter',
        logo VARCHAR(255),
        site_subtitle VARCHAR(255),
        logo_position VARCHAR(50) DEFAULT 'left',
        subtitle_font VARCHAR(50),
        subtitle_size INTEGER,
        subtitle_color VARCHAR(7),
        logo_margin_top INTEGER DEFAULT 0,
        logo_margin_left INTEGER DEFAULT 0,
        subtitle_margin_top INTEGER DEFAULT 0,
        subtitle_margin_left INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Voeg ontbrekende kolommen toe als ze nog niet bestaan
      DO $$ 
      BEGIN
        BEGIN
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_subtitle VARCHAR(255);
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_position VARCHAR(50) DEFAULT 'left';
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS subtitle_font VARCHAR(50);
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS subtitle_size INTEGER;
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS subtitle_color VARCHAR(7);
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_margin_top INTEGER DEFAULT 0;
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_margin_left INTEGER DEFAULT 0;
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS subtitle_margin_top INTEGER DEFAULT 0;
          ALTER TABLE settings ADD COLUMN IF NOT EXISTS subtitle_margin_left INTEGER DEFAULT 0;
        EXCEPTION WHEN duplicate_column THEN
          -- Kolom bestaat al, negeer de fout
        END;
      END $$;
    `);

    // Ken rechten toe aan de kopfolio gebruiker
    await client.query(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kopfolio;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kopfolio;
    `);

    // Maak standaard home album aan als deze nog niet bestaat
    await client.query(`
      INSERT INTO albums (title, description, is_home)
      SELECT 'Home', 'Hoofdpagina album', true
      WHERE NOT EXISTS (SELECT 1 FROM albums WHERE is_home = true);
    `);

    // Maak de home pagina aan als deze nog niet bestaat
    await client.query(`
      INSERT INTO pages (title, content, slug)
      SELECT 'Home', '[]', 'home'
      WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'home');
    `);

    // Zorg ervoor dat er altijd settings zijn en update ontbrekende waarden
    await client.query(`
      INSERT INTO settings (
        site_title, 
        accent_color, 
        font, 
        site_subtitle, 
        logo_position, 
        subtitle_font, 
        subtitle_size, 
        subtitle_color,
        logo_margin_top,
        logo_margin_left,
        subtitle_margin_top,
        subtitle_margin_left
      )
      SELECT 
        'Kopfolio', 
        '#2196f3', 
        'Inter', 
        NULL, 
        'left', 
        'Roboto', 
        14, 
        '#FFFFFF',
        0,
        0,
        0,
        0
      WHERE NOT EXISTS (SELECT 1 FROM settings);

      -- Update bestaande settings met standaardwaarden als ze NULL zijn
      UPDATE settings 
      SET 
        subtitle_font = COALESCE(subtitle_font, 'Roboto'),
        subtitle_size = COALESCE(subtitle_size, 14),
        subtitle_color = COALESCE(subtitle_color, '#FFFFFF'),
        logo_margin_top = COALESCE(logo_margin_top, 0),
        logo_margin_left = COALESCE(logo_margin_left, 0),
        subtitle_margin_top = COALESCE(subtitle_margin_top, 0),
        subtitle_margin_left = COALESCE(subtitle_margin_left, 0)
      WHERE id = 1;
    `);

    await client.query('COMMIT');
    console.log('Database tabellen en initiële data succesvol aangemaakt');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fout bij het initialiseren van de database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export { pool, initDb }; 