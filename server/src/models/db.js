import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
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

export async function initDb() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Voer migraties uit
    const migrations = [
      '001_create_users.sql',
      '002_create_albums.sql',
      '003_create_photos.sql',
      '004_create_pages.sql',
      '005_create_settings.sql'
    ];

    for (const migration of migrations) {
      const migrationSql = await fs.readFile(path.join(__dirname, '..', 'db', 'migrations', migration), 'utf8');
      
      // Voer het hele migratie bestand in één keer uit voor plpgsql functies
      await client.query(migrationSql);
    }

    // Maak een standaard gebruiker aan als deze nog niet bestaat
    const hashedPassword = await bcrypt.hash('admin', 10);
    await client.query(`
      INSERT INTO users (username, password)
      SELECT 'admin', $1
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE username = 'admin'
      )
    `, [hashedPassword]);

    await client.query('COMMIT');
    console.log('Database tabellen en initiële data succesvol aangemaakt');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fout bij initialiseren database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export { pool }; 