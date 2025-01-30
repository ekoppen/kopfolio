import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base upload directory
const baseUploadDir = '/app/public/uploads';

// Specifieke directories voor verschillende type uploads
const uploadDirs = {
  photos: path.join(baseUploadDir, 'photos'),
  branding: path.join(baseUploadDir, 'branding'),
  thumbs: path.join(baseUploadDir, 'thumbs')
};

// Maak alle benodigde directories aan
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper functie om het juiste pad te krijgen voor een bestand
const getUploadPath = (type, filename) => {
  const dir = uploadDirs[type] || baseUploadDir;
  return path.join(dir, filename);
};

export { uploadDirs, getUploadPath }; 