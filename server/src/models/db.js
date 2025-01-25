import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: 5432
});

const initDb = async () => {
  try {
    // Users tabel
    await pool.query(`
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
    await pool.query(`
      INSERT INTO users (username, password)
      SELECT 'admin', $1
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
    `, [hashedPassword]);

    // Albums tabel
    await pool.query(`
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
    await pool.query(`
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        content JSONB,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        site_title VARCHAR(100) NOT NULL DEFAULT 'Kopfolio',
        accent_color VARCHAR(7) NOT NULL DEFAULT '#2196f3',
        font VARCHAR(50) NOT NULL DEFAULT 'Inter',
        logo VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ken rechten toe aan de kopfolio gebruiker
    await pool.query(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kopfolio;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kopfolio;
    `);

    // Maak standaard home album aan als deze nog niet bestaat
    await pool.query(`
      INSERT INTO albums (title, description, is_home)
      SELECT 'Home', 'Hoofdpagina album', true
      WHERE NOT EXISTS (SELECT 1 FROM albums WHERE is_home = true);
    `);

    // Maak de home pagina aan als deze nog niet bestaat
    await pool.query(`
      INSERT INTO pages (title, content, slug)
      SELECT 'Home', '[]', 'home'
      WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'home');
    `);

    // Zorg ervoor dat er altijd settings zijn
    await pool.query(`
      INSERT INTO settings (site_title, accent_color, font)
      SELECT 'Kopfolio', '#2196f3', 'Inter'
      WHERE NOT EXISTS (SELECT 1 FROM settings);
    `);

    console.log('Database tabellen en initiële data succesvol aangemaakt');
  } catch (error) {
    console.error('Fout bij het initialiseren van de database:', error);
    throw error;
  }
};

export { pool, initDb }; 