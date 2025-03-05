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
    // Voer de migraties uit in de juiste volgorde
    await runMigration('add_logo_enabled.sql');
    await runJsMigration('add_favicon_field.js');
    
    console.log('All migrations completed');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
};

runMigrations(); 