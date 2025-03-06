import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// ES modules equivalent van __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432
});

const runMigration = async (filename) => {
  try {
    const filePath = path.join(__dirname, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Running migration: ${filename}`);
    await pool.query(sql);
    console.log(`Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`Error running migration ${filename}:`, error);
  }
};

const runJsMigration = async (filename) => {
  try {
    console.log(`Running JS migration: ${filename}`);
    // Dynamisch importeren van het JS migratiescript
    const migrationModule = await import(`./${filename}`);
    console.log(`JS Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`Error running JS migration ${filename}:`, error);
  }
};

const runMigrations = async () => {
  try {
    // Maak de migrations tabel aan als deze nog niet bestaat
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Lees alle SQL migratie bestanden
    const migrationsDir = path.join(__dirname);
    const sqlFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sorteer om volgorde te garanderen

    // Lees alle JS migratie bestanden
    const jsFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'run_migrations.js')
      .sort(); // Sorteer om volgorde te garanderen

    // Voer SQL migraties uit
    for (const file of sqlFiles) {
      // Controleer of de migratie al is uitgevoerd
      const { rows } = await pool.query('SELECT * FROM migrations WHERE name = $1', [file]);
      
      if (rows.length === 0) {
        await runMigration(file);
        // Registreer de migratie als uitgevoerd
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      } else {
        console.log(`Migration ${file} already executed, skipping`);
      }
    }

    // Voer JS migraties uit
    for (const file of jsFiles) {
      // Controleer of de migratie al is uitgevoerd
      const { rows } = await pool.query('SELECT * FROM migrations WHERE name = $1', [file]);
      
      if (rows.length === 0) {
        await runJsMigration(file);
        // Registreer de migratie als uitgevoerd
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      } else {
        console.log(`JS Migration ${file} already executed, skipping`);
      }
    }
    
    console.log('All migrations completed');
    
    // Alleen afsluiten als het script direct wordt uitgevoerd (niet als het wordt geïmporteerd)
    if (process.argv[1] === fileURLToPath(import.meta.url)) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    if (process.argv[1] === fileURLToPath(import.meta.url)) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

// Voer migraties uit als het script direct wordt uitgevoerd
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
}

// Exporteer de functie voor gebruik in andere modules
export { runMigrations }; 