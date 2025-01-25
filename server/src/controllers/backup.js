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

const router = express.Router();
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Functie om een backup te maken van alle data
const exportBackup = async (req, res) => {
  try {
    // Maak een tijdelijke map voor de backup in de Docker container
    const tempDir = '/app/temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      // Zet de juiste permissies
      fs.chmodSync(tempDir, '777');
    }

    const backupPath = path.join(tempDir, 'backup.zip');
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
        // Verwijder het tijdelijke bestand na download
        try {
          fs.unlinkSync(backupPath);
        } catch (unlinkError) {
          console.error('Error removing temp file:', unlinkError);
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Pipe het archief naar het output bestand
    archive.pipe(output);

    // Maak een PostgreSQL dump
    const dumpFile = path.join(tempDir, 'database.sql');
    await execAsync(`PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${dumpFile}`);

    // Voeg de database dump toe aan de backup
    archive.file(dumpFile, { name: 'database.sql' });

    // Voeg de uploads mappen toe
    const uploadsDir = '/app/public/uploads';
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, 'uploads');
    } else {
      console.warn('Uploads directory does not exist:', uploadsDir);
    }

    // Sluit het archief
    await archive.finalize();

    // Verwijder de tijdelijke database dump
    try {
      fs.unlinkSync(dumpFile);
    } catch (unlinkError) {
      console.error('Error removing dump file:', unlinkError);
    }

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het maken van de backup' });
  }
};

// Functie om een backup te importeren
const importBackup = async (req, res) => {
  if (!req.files || !req.files.backup) {
    return res.status(400).json({ error: 'Geen backup bestand ontvangen' });
  }

  try {
    const backupFile = req.files.backup;
    const tempDir = path.join(__dirname, '../../temp');
    const extractDir = path.join(tempDir, 'extract');

    // Maak tijdelijke mappen aan
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true });
    }
    fs.mkdirSync(extractDir);

    // Verplaats het geüploade bestand naar temp directory
    const backupPath = path.join(tempDir, 'backup.zip');
    await backupFile.mv(backupPath);

    // Pak het bestand uit
    await fs.createReadStream(backupPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // Herstel de database van de dump
    const dumpFile = path.join(extractDir, 'database.sql');
    await execAsync(`psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${dumpFile}`);

    // Vervang de uploads map
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true });
    }
    fs.renameSync(path.join(extractDir, 'uploads'), uploadsDir);

    // Ruim tijdelijke bestanden op
    fs.unlinkSync(backupPath);
    fs.rmSync(extractDir, { recursive: true });

    res.json({ message: 'Backup succesvol geïmporteerd' });

  } catch (error) {
    console.error('Error importing backup:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het importeren van de backup' });
  }
};

// Routes configureren
router.get('/export', verifyToken, exportBackup);
router.post('/import', verifyToken, importBackup);

export default router; 