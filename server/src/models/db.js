import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Database tabellen aanmaken
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

    // Albums tabel
    await pool.query(`
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        is_home BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

    // Maak standaard home album aan als deze nog niet bestaat
    await pool.query(`
      INSERT INTO albums (title, description, is_home)
      VALUES ('Home', 'Hoofdpagina album', true)
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database tabellen succesvol aangemaakt');
  } catch (error) {
    console.error('Fout bij het initialiseren van de database:', error);
    throw error;
  }
};

export { pool, initDb }; 