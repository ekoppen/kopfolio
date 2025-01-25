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
    const includePhotos = req.query.includePhotos !== 'false'; // Default true

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
    // Maak altijd een volledige dump, maar markeer of het een volledige of gedeeltelijke backup is
    await execAsync(`PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${dumpFile}`);
    
    // Voeg een marker toe aan het begin van het bestand om aan te geven of het een volledige backup is
    const markerContent = `-- BACKUP_TYPE: ${includePhotos ? 'FULL' : 'PARTIAL'}\n`;
    const originalContent = fs.readFileSync(dumpFile, 'utf8');
    fs.writeFileSync(dumpFile, markerContent + originalContent);

    // Voeg de uploads mappen toe als includePhotos true is
    if (includePhotos) {
      const uploadsDir = '/app/public/uploads';
      if (fs.existsSync(uploadsDir)) {
        archive.directory(uploadsDir, 'uploads');
      } else {
        console.warn('Uploads directory does not exist:', uploadsDir);
      }
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

  const includePhotos = req.body.includePhotos === 'true'; // Default false voor veiligheid

  try {
    console.log('Start import proces...');
    console.log('Include photos:', includePhotos);
    const backupFile = req.files.backup;
    const tempDir = '/app/temp';
    const extractDir = path.join(tempDir, 'extract');

    // Stuur status update
    res.write(JSON.stringify({ status: 'Voorbereiden van import...', progress: 10 }));

    // Controleer en maak temp directory
    console.log('Controleren van temp directory:', tempDir);
    try {
      if (!fs.existsSync(tempDir)) {
        console.log('Maken van temp directory...');
        fs.mkdirSync(tempDir, { recursive: true });
      }
      fs.chmodSync(tempDir, '777');
      console.log('Temp directory rechten gezet');
    } catch (err) {
      console.error('Fout bij maken/instellen temp directory:', err);
      throw err;
    }

    // Controleer en maak extract directory
    console.log('Controleren van extract directory:', extractDir);
    try {
      if (fs.existsSync(extractDir)) {
        console.log('Verwijderen van bestaande extract directory...');
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
      fs.mkdirSync(extractDir, { recursive: true });
      fs.chmodSync(extractDir, '777');
      console.log('Extract directory aangemaakt en rechten gezet');
    } catch (err) {
      console.error('Fout bij maken/instellen extract directory:', err);
      throw err;
    }

    // Verplaats het geüploade bestand
    const backupPath = path.join(tempDir, 'backup.zip');
    console.log('Verplaatsen van backup bestand naar:', backupPath);
    try {
      await backupFile.mv(backupPath);
      console.log('Backup bestand succesvol verplaatst');
    } catch (err) {
      console.error('Fout bij verplaatsen backup bestand:', err);
      throw err;
    }

    // Stuur status update
    res.write(JSON.stringify({ status: 'Backup bestand uitpakken...', progress: 30 }));

    // Controleer of het backup bestand bestaat en leesbaar is
    console.log('Controleren van backup bestand...');
    try {
      const stats = fs.statSync(backupPath);
      console.log('Backup bestand grootte:', stats.size, 'bytes');
    } catch (err) {
      console.error('Fout bij controleren backup bestand:', err);
      throw err;
    }

    // Pak het bestand uit
    console.log('Uitpakken van backup bestand...');
    try {
      await fs.createReadStream(backupPath)
        .pipe(unzipper.Extract({ path: extractDir }))
        .promise();
      console.log('Backup bestand succesvol uitgepakt');
    } catch (err) {
      console.error('Fout bij uitpakken backup bestand:', err);
      throw err;
    }

    // Stuur status update
    res.write(JSON.stringify({ status: 'Database herstellen...', progress: 50 }));

    // Bij importeren, lees eerst het type backup
    console.log('Controleren van backup type...');
    const dumpFile = path.join(extractDir, 'database.sql');
    const dumpContent = fs.readFileSync(dumpFile, 'utf8');
    const backupTypeMatch = dumpContent.match(/^-- BACKUP_TYPE: (FULL|PARTIAL)/);
    const isFullBackup = backupTypeMatch ? backupTypeMatch[1] === 'FULL' : true; // Default naar full voor oude backups
    
    console.log('Backup type:', isFullBackup ? 'FULL' : 'PARTIAL');
    
    // Als de gebruiker een partiële import wil maar het is een volledige backup,
    // of als het een partiële backup is, extraheer dan alleen de relevante tabellen
    if (!includePhotos || !isFullBackup) {
      console.log('Uitvoeren van partiële import...');
      
      // Maak een tijdelijk bestand voor de gefilterde inhoud
      const filteredDumpFile = path.join(tempDir, 'filtered_dump.sql');
      
      // Verwijder eerst de bestaande tabellen
      console.log('Verwijderen van bestaande tabellen...');
      await execAsync(`
        PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -c "
          DROP TABLE IF EXISTS pages CASCADE;
          DROP TABLE IF EXISTS settings CASCADE;
          DROP TABLE IF EXISTS users CASCADE;
        "
      `);
      
      // Filter de relevante delen uit de originele dump
      console.log('Filteren van database dump...');
      const dumpLines = dumpContent.split('\n');
      const filteredLines = [];
      let isRelevantSection = false;
      let openBrackets = 0;
      let inCopySection = false;
      
      for (const line of dumpLines) {
        // Behoud de backup type marker
        if (line.startsWith('-- BACKUP_TYPE:')) {
          filteredLines.push(line);
          continue;
        }
        
        // Behoud algemene PostgreSQL instellingen
        if (line.startsWith('SET ')) {
          filteredLines.push(line);
          continue;
        }
        
        // Check voor relevante secties
        if (line.includes('CREATE TABLE') && 
            (line.includes('settings') || line.includes('pages') || line.includes('users'))) {
          isRelevantSection = true;
        }
        
        // Check voor COPY statements
        if (line.startsWith('COPY ') && 
            (line.includes('settings') || line.includes('pages') || line.includes('users'))) {
          isRelevantSection = true;
          inCopySection = true;
        }
        
        // Check voor einde van COPY sectie
        if (inCopySection && line.trim() === '\\.') {
          filteredLines.push(line);
          inCopySection = false;
          isRelevantSection = false;
          continue;
        }
        
        // Check voor ALTER TABLE statements
        if (line.includes('ALTER TABLE') && 
            (line.includes('settings') || line.includes('pages') || line.includes('users'))) {
          filteredLines.push(line);
          continue;
        }
        
        // Volg accolades voor CREATE TABLE secties
        if (isRelevantSection) {
          if (!inCopySection) {
            openBrackets += (line.match(/\(/g) || []).length;
            openBrackets -= (line.match(/\)/g) || []).length;
          }
          filteredLines.push(line);
          
          if (!inCopySection && openBrackets === 0 && line.trim().endsWith(';')) {
            isRelevantSection = false;
          }
        }
        
        // Behoud sequence updates voor relevante tabellen
        if (line.includes('SELECT pg_catalog.setval') && 
            (line.includes('settings') || line.includes('pages') || line.includes('users'))) {
          filteredLines.push(line);
        }
      }
      
      // Schrijf de gefilterde inhoud naar een bestand
      fs.writeFileSync(filteredDumpFile, filteredLines.join('\n'));
      
      // Importeer de gefilterde dump
      console.log('Importeren van gefilterde database dump...');
      const { stdout, stderr } = await execAsync(`
        PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${filteredDumpFile}
      `);
      
      // Log de output voor debugging
      if (stderr) {
        // Filter bekende waarschuwingen
        const errorLines = stderr.split('\n').filter(line => {
          // Negeer waarschuwingen over transaction_timeout
          if (line.includes('unrecognized configuration parameter "transaction_timeout"')) {
            return false;
          }
          // Negeer waarschuwingen over sequence aanpassingen
          if (line.includes('ALTER SEQUENCE')) {
            return false;
          }
          // Negeer waarschuwingen over setval
          if (line.includes('setval')) {
            return false;
          }
          // Negeer waarschuwingen over niet-bestaande objecten
          if (line.includes('does not exist')) {
            return false;
          }
          return line.toLowerCase().includes('error');
        });

        if (errorLines.length > 0) {
          console.error('Database restore errors:', errorLines);
          throw new Error('Er zijn fouten opgetreden bij het importeren van de database. Controleer de server logs voor details.');
        } else {
          console.log('Database restore waarschuwingen (genegeerd):', stderr);
        }
      }
      if (stdout) {
        console.log('Database restore output (stdout):', stdout);
      }

      // Verwijder het tijdelijke bestand
      try {
        fs.unlinkSync(filteredDumpFile);
      } catch (err) {
        console.error('Fout bij verwijderen gefilterde dump:', err);
      }
    } else {
      // Voor een volledige import, gebruik de normale psql import
      console.log('Uitvoeren van volledige import...');
      const { stdout, stderr } = await execAsync(`
        PGPASSWORD=${process.env.DB_PASSWORD} psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${dumpFile}
      `);
      
      // Log de output voor debugging
      if (stderr) {
        // Filter bekende waarschuwingen
        const errorLines = stderr.split('\n').filter(line => {
          // Negeer waarschuwingen over transaction_timeout
          if (line.includes('unrecognized configuration parameter "transaction_timeout"')) {
            return false;
          }
          // Negeer waarschuwingen over sequence aanpassingen
          if (line.includes('ALTER SEQUENCE')) {
            return false;
          }
          // Negeer waarschuwingen over setval
          if (line.includes('setval')) {
            return false;
          }
          // Negeer waarschuwingen over niet-bestaande objecten bij --clean
          if (line.includes('does not exist')) {
            return false;
          }
          return line.toLowerCase().includes('error');
        });

        if (errorLines.length > 0) {
          console.error('Database restore errors:', errorLines);
          throw new Error('Er zijn fouten opgetreden bij het importeren van de database. Controleer de server logs voor details.');
        } else {
          console.log('Database restore waarschuwingen (genegeerd):', stderr);
        }
      }
      if (stdout) {
        console.log('Database restore output (stdout):', stdout);
      }
      
      console.log('Database succesvol hersteld');
    }

    // Stuur status update
    res.write(JSON.stringify({ status: 'Bestanden herstellen...', progress: 70 }));

    // Vervang de uploads map alleen als includePhotos true is
    if (includePhotos) {
      const uploadsDir = '/app/public/uploads';
      const tempUploadsDir = path.join(tempDir, 'uploads_temp');
      
      console.log('Verwerken van uploads directory...');
      console.log('Uploads directory:', uploadsDir);
      console.log('Temp uploads directory:', tempUploadsDir);

      try {
        // Verplaats eerst de uitgepakte uploads naar een tijdelijke locatie
        console.log('Verplaatsen van uitgepakte uploads naar tijdelijke locatie...');
        const extractedUploadsPath = path.join(extractDir, 'uploads');
        if (!fs.existsSync(extractedUploadsPath)) {
          throw new Error(`Uitgepakte uploads directory bestaat niet: ${extractedUploadsPath}`);
        }
        fs.renameSync(extractedUploadsPath, tempUploadsDir);
        console.log('Uploads succesvol verplaatst naar tijdelijke locatie');

        // Maak de uploads directory aan als deze niet bestaat
        if (!fs.existsSync(uploadsDir)) {
          console.log('Maken van uploads directory...');
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Kopieer de bestanden van de tijdelijke uploads naar de echte uploads directory
        console.log('Kopiëren van bestanden naar uploads directory...');
        const tempFiles = fs.readdirSync(tempUploadsDir);
        console.log(`Aantal bestanden te kopiëren: ${tempFiles.length}`);

        for (const file of tempFiles) {
          const sourcePath = path.join(tempUploadsDir, file);
          const targetPath = path.join(uploadsDir, file);
          console.log(`Kopiëren van: ${sourcePath} naar: ${targetPath}`);

          try {
            const stat = fs.statSync(sourcePath);
            if (stat.isDirectory()) {
              // Als de doelmap al bestaat, verwijder deze eerst
              if (fs.existsSync(targetPath)) {
                console.log(`Verwijderen van bestaande directory: ${targetPath}`);
                fs.rmSync(targetPath, { recursive: true, force: true });
              }
              console.log(`Kopiëren van directory: ${file}`);
              fs.cpSync(sourcePath, targetPath, { recursive: true, force: true });
            } else {
              // Als het bestand al bestaat, verwijder het eerst
              if (fs.existsSync(targetPath)) {
                console.log(`Verwijderen van bestaand bestand: ${targetPath}`);
                fs.unlinkSync(targetPath);
              }
              console.log(`Kopiëren van bestand: ${file}`);
              fs.copyFileSync(sourcePath, targetPath);
            }
          } catch (err) {
            console.error(`Fout bij kopiëren van ${file}:`, err);
            throw err;
          }
        }

        console.log('Alle bestanden succesvol gekopieerd');
        fs.chmodSync(uploadsDir, '777');
        console.log('Rechten gezet op uploads directory');

      } catch (err) {
        console.error('Fout bij verwerken van uploads:', err);
        throw err;
      }
    } else {
      console.log('Overslaan van uploads directory (niet geselecteerd voor import)');
    }

    // Stuur status update
    res.write(JSON.stringify({ status: 'Tijdelijke bestanden opruimen...', progress: 90 }));

    // Ruim tijdelijke bestanden op
    try {
      console.log('Opruimen van tijdelijke bestanden...');
      if (fs.existsSync(backupPath)) {
        console.log('Verwijderen van backup bestand:', backupPath);
        fs.unlinkSync(backupPath);
      }
      if (fs.existsSync(extractDir)) {
        console.log('Verwijderen van extract directory:', extractDir);
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
      if (fs.existsSync(tempUploadsDir)) {
        console.log('Verwijderen van tijdelijke uploads directory:', tempUploadsDir);
        fs.rmSync(tempUploadsDir, { recursive: true, force: true });
      }
      console.log('Tijdelijke bestanden succesvol opgeruimd');
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }

    // Stuur laatste status update en sluit de response
    console.log('Import proces succesvol afgerond');
    res.write(JSON.stringify({ 
      status: 'Import voltooid', 
      progress: 100,
      success: true,
      message: 'Backup succesvol geïmporteerd'
    }));
    res.end();

  } catch (error) {
    console.error('Error importing backup:', error);
    console.error('Stack trace:', error.stack);
    res.write(JSON.stringify({ 
      status: 'Er is een fout opgetreden', 
      progress: 0, 
      success: false,
      error: error.message,
      details: error.stack
    }));
    res.end();
  }
};

// Routes configureren
router.get('/export', verifyToken, exportBackup);
router.post('/import', verifyToken, importBackup);

export default router; 