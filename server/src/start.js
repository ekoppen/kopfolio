import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkDatabase() {
  while (true) {
    try {
      await execAsync(`pg_isready -h ${process.env.DB_HOST} -U ${process.env.DB_USER}`);
      console.log('Database is beschikbaar');
      break;
    } catch (error) {
      console.log('Wachten op database...');
      await wait(1000);
    }
  }
}

async function setupDirectories() {
  const dirs = [
    path.join(__dirname, '../public/uploads/photos'),
    path.join(__dirname, '../public/uploads/thumbs'),
    path.join(__dirname, '../public/uploads/branding'),
    path.join(__dirname, '../public/patterns')
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Map aangemaakt: ${dir}`);
    }
  }
}

async function copyDemoPhotos() {
  const demoPhoto = path.join(__dirname, '../public/uploads/photos/demo1.jpg');
  if (!fs.existsSync(demoPhoto)) {
    console.log('Kopiëren van demo foto\'s...');
    const demoDir = path.join(__dirname, '../demo-images');
    const photosDir = path.join(__dirname, '../public/uploads/photos');
    
    const files = fs.readdirSync(demoDir);
    for (const file of files) {
      fs.copyFileSync(
        path.join(demoDir, file),
        path.join(photosDir, file)
      );
    }
  }
}

async function generateThumbnails() {
  console.log('Genereren van thumbnails...');
  await import('./scripts/generate-thumbnails.js');
}

async function runMigrations() {
  console.log('Uitvoeren van database migraties...');
  try {
    const { runMigrations } = await import('./migrations/run_migrations.js');
    await runMigrations();
    console.log('Database migraties succesvol uitgevoerd');
  } catch (error) {
    console.error('Fout bij uitvoeren van migraties:', error);
    throw error;
  }
}

async function start() {
  try {
    await checkDatabase();
    await setupDirectories();
    await copyDemoPhotos();
    await generateThumbnails();
    await runMigrations();
    
    // Start de applicatie
    const { spawn } = await import('child_process');
    spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  } catch (error) {
    console.error('Error tijdens startup:', error);
    process.exit(1);
  }
}

start(); 