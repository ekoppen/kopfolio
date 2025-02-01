import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const photosDir = path.join(__dirname, '../../public/uploads/photos');
const thumbsDir = path.join(__dirname, '../../public/uploads/thumbs');

// Zorg ervoor dat de thumbs map bestaat
if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

// Lees alle foto's
const photos = fs.readdirSync(photosDir);

// Genereer thumbnails
for (const photo of photos) {
  const photoPath = path.join(photosDir, photo);
  const thumbPath = path.join(thumbsDir, `thumb_${photo}`);

  // Sla over als thumbnail al bestaat
  if (fs.existsSync(thumbPath)) {
    console.log(`Thumbnail bestaat al voor ${photo}`);
    continue;
  }

  try {
    await sharp(photoPath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'centre'
      })
      .toFile(thumbPath);
    console.log(`Thumbnail gegenereerd voor ${photo}`);
  } catch (error) {
    console.error(`Fout bij genereren thumbnail voor ${photo}:`, error);
  }
}

console.log('Klaar met genereren van thumbnails'); 