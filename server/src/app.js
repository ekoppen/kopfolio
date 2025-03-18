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
import usersRouter from './routes/users.js';
import imagesRouter from './routes/images.js';
import contactRouter from './routes/contact.js';
import { uploadDirs } from './middleware/upload.js';
import checkDatabaseStructure from './scripts/check_database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Basic middleware
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? 
  process.env.CORS_ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Content-Length']
}));

// Verhoog de limiet voor JSON requests naar 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files first, before any other middleware
const baseUploadDir = '/app/public/uploads';
app.use('/uploads', express.static(baseUploadDir));
app.use('/patterns', express.static('/app/public/patterns'));
app.use('/fonts', express.static('/app/public/fonts', {
  setHeaders: (res, filePath) => {
    console.log('Serving font file:', filePath);
    
    // Stel de juiste MIME types in voor verschillende font formaten
    if (filePath.endsWith('.ttf')) {
      res.set('Content-Type', 'font/ttf');
    } else if (filePath.endsWith('.woff')) {
      res.set('Content-Type', 'font/woff');
    } else if (filePath.endsWith('.woff2')) {
      res.set('Content-Type', 'font/woff2');
    } else if (filePath.endsWith('.otf')) {
      res.set('Content-Type', 'font/otf');
    }
    
    // Cache headers voor betere performance
    res.set({
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
  }
}));

// File upload middleware alleen voor routes die het nodig hebben
const fileUploadMiddleware = fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true,
  parseNested: true,
  safeFileNames: true,
  preserveExtension: true,
  responseOnLimit: "File size limit has been reached",
  uploadTimeout: 60000,
  maxFileSize: 100 * 1024 * 1024,
  maxFiles: 1,
  parseNested: true,
  preserveExtension: true,
  safeFileNames: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true,
  abortOnLimit: true,
  responseOnLimit: "File size limit has been reached",
  uploadTimeout: 60000,
  maxFileSize: 100 * 1024 * 1024,
  maxFiles: 1
});

// Routes met file upload middleware waar nodig
app.use('/api/photos', fileUploadMiddleware, photosRouter);
app.use('/api/albums', fileUploadMiddleware, albumsRouter);
app.use('/api/settings', fileUploadMiddleware, settingsRouter);
app.use('/api/pages', fileUploadMiddleware, pagesRouter);
app.use('/api/auth', fileUploadMiddleware, authRouter);
app.use('/api/backup', fileUploadMiddleware, backupRouter);
app.use('/api/users', fileUploadMiddleware, usersRouter);
app.use('/api/images', fileUploadMiddleware, imagesRouter);
app.use('/api/contact', fileUploadMiddleware, contactRouter);

// Controleer de database structuur bij het opstarten
checkDatabaseStructure();

export default app; 