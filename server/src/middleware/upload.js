import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base upload directory
const baseUploadDir = '/app/public';

// Specifieke directories voor verschillende type uploads
const uploadDirs = {
  photos: path.join(baseUploadDir, 'uploads/photos'),
  branding: path.join(baseUploadDir, 'uploads/branding'),
  thumbs: path.join(baseUploadDir, 'uploads/thumbs'),
  images: path.join(baseUploadDir, 'uploads/images'),
  fonts: path.join(baseUploadDir, 'fonts')  // Directory voor fonts
};

// Maak alle benodigde directories aan
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper functie om het juiste pad te krijgen voor een bestand
const getUploadPath = (type, filename) => {
  if (!type) {
    console.error('getUploadPath: type parameter is required');
    return null;
  }
  
  const dir = uploadDirs[type];
  if (!dir) {
    console.error(`getUploadPath: Invalid upload type: ${type}`);
    return null;
  }

  if (!filename) {
    return dir;
  }

  return path.join(dir, filename);
};

export { uploadDirs, getUploadPath }; 