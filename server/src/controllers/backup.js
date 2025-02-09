import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import unzipper from 'unzipper';
import { pool } from '../models/db.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifyToken } from '../middleware/auth.js';
import express from 'express';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const router = express.Router();
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Status object voor import voortgang
const importStatus = {
  isImporting: false,
  currentStep: '',
  progress: 0,
  error: null
};

// Functie om de status bij te werken
const updateStatus = (step, progress = null, error = null) => {
  importStatus.currentStep = step;
  if (progress !== null) importStatus.progress = progress;
  if (error !== null) importStatus.error = error;
  console.log('Import status:', importStatus);
};

// Endpoint om de status op te vragen
router.get('/import/status', verifyToken, (req, res) => {
  res.json(importStatus);
});

// Functie om het admin account te resetten
async function resetAdminAccount() {
  const client = await pool.connect();
  try {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await client.query(`
      INSERT INTO users (username, password)
      VALUES ('admin', $1)
      ON CONFLICT (username) 
      DO UPDATE SET password = $1
    `, [hashedPassword]);
    console.log('Admin account reset to default credentials');
  } catch (error) {
    console.error('Error resetting admin account:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Functie om een backup te maken van alle data
const exportBackup = async (req, res) => {
  const tempDir = path.join(__dirname, '../../temp');
  const backupPath = path.join(tempDir, 'backup.zip');
  const dumpFile = path.join(tempDir, 'database.sql');

  try {
    // Maak een tijdelijke map voor de backup als deze niet bestaat
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Verwijder oude backup bestanden als deze bestaan
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    if (fs.existsSync(dumpFile)) {
      fs.unlinkSync(dumpFile);
    }

    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compressie
    });

    // Luister naar archiver events
    output.on('close', () => {
      // Stuur het bestand naar de client
      res.download(backupPath, 'backup.zip', (err) => {
        if (err) {
          console.error('Error sending backup:', err);
        }
        // Verwijder de tijdelijke bestanden na download
        try {
          if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
          if (fs.existsSync(dumpFile)) fs.unlinkSync(dumpFile);
        } catch (unlinkError) {
          console.error('Error removing temp files:', unlinkError);
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Pipe het archief naar het output bestand
    archive.pipe(output);

    try {
      // Maak een PostgreSQL dump
      await execAsync(`PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${dumpFile}`);
    } catch (dumpError) {
      console.error('Error creating database dump:', dumpError);
      throw new Error('Database backup failed');
    }

    // Voeg de database dump toe aan de backup
    if (fs.existsSync(dumpFile)) {
      archive.file(dumpFile, { name: 'database.sql' });
    } else {
      throw new Error('Database dump file not created');
    }

    // Voeg de uploads mappen toe
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, 'uploads');
    } else {
      console.warn('Uploads directory does not exist:', uploadsDir);
      // Maak een lege uploads map aan
      fs.mkdirSync(uploadsDir, { recursive: true });
      archive.directory(uploadsDir, 'uploads');
    }

    // Sluit het archief
    await archive.finalize();

  } catch (error) {
    console.error('Error creating backup:', error);
    // Cleanup tijdelijke bestanden bij error
    try {
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
      if (fs.existsSync(dumpFile)) fs.unlinkSync(dumpFile);
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }
    res.status(500).json({ error: 'Er is een fout opgetreden bij het maken van de backup' });
  }
};

// Functie om een backup te importeren
const importBackup = async (req, res) => {
  if (importStatus.isImporting) {
    return res.status(400).json({ error: 'Er is al een import bezig' });
  }

  importStatus.isImporting = true;
  importStatus.error = null;
  importStatus.progress = 0;
  updateStatus('Import gestart');
  
  if (!req.files || !req.files.backup) {
    importStatus.isImporting = false;
    updateStatus('Fout', 0, 'Geen backup bestand ontvangen');
    return res.status(400).json({ error: 'Geen backup bestand ontvangen' });
  }

  const tempDir = path.join(__dirname, '../../temp');
  const extractDir = path.join(tempDir, 'extract');
  const backupPath = path.join(tempDir, 'backup.zip');
  const tempDumpFile = path.join(tempDir, 'temp_database.sql');
  let client = null;
  let currentAdminPassword = null;

  try {
    // Maak tijdelijke mappen aan
    updateStatus('Voorbereiden van tijdelijke mappen', 5);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    if (fs.existsSync(extractDir)) {
      try {
        fs.rmSync(extractDir, { recursive: true, force: true });
      } catch (rmError) {
        console.error('Error removing extract directory:', rmError);
        const files = fs.readdirSync(extractDir);
        for (const file of files) {
          try {
            fs.rmSync(path.join(extractDir, file), { recursive: true, force: true });
          } catch (e) {
            console.error(`Failed to remove ${file}:`, e);
          }
        }
      }
    }
    fs.mkdirSync(extractDir);

    // Verplaats het geüploade bestand
    updateStatus('Backup bestand verplaatsen', 10);
    await req.files.backup.mv(backupPath);

    // Pak het bestand uit
    updateStatus('Backup bestand uitpakken', 20);
    await new Promise((resolve, reject) => {
      fs.createReadStream(backupPath)
        .pipe(unzipper.Extract({ path: extractDir }))
        .on('close', () => resolve())
        .on('error', (err) => reject(err));
    });

    // Controleer de bestanden
    updateStatus('Backup bestanden controleren', 30);
    const dumpFile = path.join(extractDir, 'database.sql');
    if (!fs.existsSync(dumpFile)) {
      throw new Error('Invalid backup: missing database.sql');
    }

    try {
      // Sla het huidige admin wachtwoord op
      updateStatus('Admin account backup maken', 40);
      client = await pool.connect();
      try {
        const adminResult = await client.query(
          'SELECT password FROM users WHERE username = $1',
          ['admin']
        );
        currentAdminPassword = adminResult.rows[0]?.password;
      } catch (pwError) {
        console.error('Error getting admin password:', pwError);
      } finally {
        if (client) {
          await client.release();
          client = null;
        }
      }

      // Verwijder de transaction_timeout parameter uit het dump bestand
      updateStatus('Database dump voorbereiden', 45);
      const dumpContent = fs.readFileSync(dumpFile, 'utf8');
      const modifiedDump = dumpContent.replace(/SET transaction_timeout = \d+;/g, '');
      fs.writeFileSync(tempDumpFile, modifiedDump);

      // Drop alle tabellen
      updateStatus('Database voorbereiden', 50);
      const dropCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;"`;
      await execAsync(dropCommand);
      
      // Wacht even om er zeker van te zijn dat alle connecties weg zijn
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Importeer de database dump
      updateStatus('Database importeren', 60);
      const importCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${tempDumpFile}`;
      await execAsync(importCommand);

      // Herstel het admin wachtwoord als deze bestond
      if (currentAdminPassword) {
        updateStatus('Admin account herstellen', 70);
        client = await pool.connect();
        try {
          await client.query(
            'UPDATE users SET password = $1 WHERE username = $2',
            [currentAdminPassword, 'admin']
          );
        } catch (pwError) {
          console.error('Error restoring admin password:', pwError);
        } finally {
          if (client) {
            await client.release();
            client = null;
          }
        }
      }

      // Zorg ervoor dat de settings tabel de nieuwe kolommen heeft
      updateStatus('Settings tabel controleren', 75);
      client = await pool.connect();
      try {
        // Controleer of de nieuwe kolommen bestaan en voeg ze toe indien nodig
        const columns = ['footer_font', 'footer_size', 'footer_color'];
        const columnTypes = {
          'footer_font': 'VARCHAR(255)',
          'footer_size': 'INTEGER',
          'footer_color': 'VARCHAR(255)'
        };
        
        for (const column of columns) {
          const columnExists = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'settings' 
            AND column_name = $1
          `, [column]);

          if (columnExists.rows.length === 0) {
            await client.query(`
              ALTER TABLE settings 
              ADD COLUMN ${column} ${columnTypes[column]}
            `);
          }
        }
      } catch (settingsError) {
        console.error('Error checking/updating settings table:', settingsError);
      } finally {
        if (client) {
          await client.release();
          client = null;
        }
      }

      // Kopieer de uploads map
      updateStatus('Uploads kopiëren', 80);
      const uploadsDir = path.join(__dirname, '../../public/uploads');
      const extractedUploadsDir = path.join(extractDir, 'uploads');
      
      // Verwijder de bestaande uploads map
      if (fs.existsSync(uploadsDir)) {
        fs.rmSync(uploadsDir, { recursive: true, force: true });
      }
      
      // Maak een nieuwe uploads map aan
      fs.mkdirSync(uploadsDir, { recursive: true });
      
      // Kopieer de geëxtraheerde uploads als deze bestaan
      if (fs.existsSync(extractedUploadsDir)) {
        fs.cpSync(extractedUploadsDir, uploadsDir, { recursive: true });
      }

    } catch (restoreError) {
      console.error('Error restoring database:', restoreError);
      throw new Error('Database restore failed: ' + restoreError.message);
    }

    // Ruim op
    updateStatus('Tijdelijke bestanden opruimen', 90);
    try {
      if (fs.existsSync(backupPath)) {
        try {
          fs.unlinkSync(backupPath);
        } catch (e) {
          console.error('Error removing backup file:', e);
        }
      }
      if (fs.existsSync(extractDir)) {
        try {
          fs.rmSync(extractDir, { recursive: true, force: true });
        } catch (e) {
          console.error('Error removing extract directory:', e);
        }
      }
      if (fs.existsSync(tempDumpFile)) {
        try {
          fs.unlinkSync(tempDumpFile);
        } catch (e) {
          console.error('Error removing temp dump file:', e);
        }
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }

    updateStatus('Import voltooid', 100);
    importStatus.isImporting = false;
    res.json({ message: 'Backup succesvol geïmporteerd' });

    // Server moet opnieuw opstarten om de nieuwe database te laden
    process.exit(0);

  } catch (error) {
    console.error('Error importing backup:', error);
    updateStatus('Fout', 0, error.message);
    
    // Cleanup
    try {
      if (fs.existsSync(backupPath)) {
        try {
          fs.unlinkSync(backupPath);
        } catch (e) {
          console.error('Error removing backup file:', e);
        }
      }
      if (fs.existsSync(extractDir)) {
        try {
          fs.rmSync(extractDir, { recursive: true, force: true });
        } catch (e) {
          console.error('Error removing extract directory:', e);
        }
      }
      if (fs.existsSync(tempDumpFile)) {
        try {
          fs.unlinkSync(tempDumpFile);
        } catch (e) {
          console.error('Error removing temp dump file:', e);
        }
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }

    // Release de client connectie als die nog bestaat
    if (client) {
      try {
        await client.release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }

    importStatus.isImporting = false;
    res.status(500).json({ error: `Er is een fout opgetreden bij het importeren van de backup: ${error.message}` });
  }
};

// Routes configureren
router.get('/export', verifyToken, exportBackup);
router.post('/import', verifyToken, importBackup);

export default router; 