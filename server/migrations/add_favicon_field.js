import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432
});

/**
 * Migratie om een favicon veld toe te voegen aan de settings tabel
 */
const migrate = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Controleer of het favicon veld al bestaat
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND column_name = 'favicon'
    `);
    
    // Voeg het favicon veld toe als het nog niet bestaat
    if (checkResult.rows.length === 0) {
      console.log('Voeg favicon veld toe aan settings tabel...');
      await client.query(`
        ALTER TABLE settings 
        ADD COLUMN favicon TEXT
      `);
      console.log('Favicon veld succesvol toegevoegd.');
    } else {
      console.log('Favicon veld bestaat al in de settings tabel.');
    }
    
    await client.query('COMMIT');
    console.log('Migratie succesvol afgerond.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Fout bij uitvoeren van migratie:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Voer de migratie uit
migrate().catch(console.error); 