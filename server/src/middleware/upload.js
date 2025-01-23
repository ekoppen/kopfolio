import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configureer opslag voor geüploade bestanden
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/app/public/uploads');
  },
  filename: function (req, file, cb) {
    // Genereer unieke bestandsnaam met timestamp en originele extensie
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter voor toegestane bestandstypen
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Ongeldig bestandstype. Alleen JPG, PNG en GIF zijn toegestaan.'), false);
  }
};

// Configureer Multer met verhoogde limieten voor multi-upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 50 // Maximum 50 bestanden tegelijk
  }
});

export default upload; 