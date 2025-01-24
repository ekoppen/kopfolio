import path from 'path';
import fs from 'fs';

// Zorg dat de uploads directory bestaat
const uploadDir = '/app/public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export { uploadDir }; 