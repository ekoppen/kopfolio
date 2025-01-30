import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pagesRouter from './routes/pages.js';
import photosRouter from './routes/photos.js';
import albumsRouter from './routes/albums.js';
import settingsRouter from './routes/settings.js';
import authRouter from './routes/auth.js';
import backupRouter from './routes/backup.js';
import { uploadDirs } from './middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true,
  parseNested: true
}));

// Static files - serve alle upload directories
const baseUploadDir = '/app/public/uploads';
app.use('/uploads', express.static(baseUploadDir));

// Routes
app.use('/api/pages', pagesRouter);
app.use('/api/photos', photosRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/auth', authRouter);
app.use('/api/backup', backupRouter);

export default app; 