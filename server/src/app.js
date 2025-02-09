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
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Basic middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Content-Length']
}));
app.use(express.json());

// Serve static files first, before any other middleware
const baseUploadDir = process.env.NODE_ENV === 'production' ? '/app/public/uploads' : './uploads';
app.use('/uploads', express.static(baseUploadDir));
app.use('/patterns', express.static(process.env.NODE_ENV === 'production' ? '/app/public/patterns' : './patterns'));
app.use('/fonts', express.static(process.env.NODE_ENV === 'production' ? '/app/public/fonts' : './fonts', {
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
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: true,
  parseNested: true
});

// Routes met file upload middleware waar nodig
app.use('/api/photos', fileUploadMiddleware, photosRouter);
app.use('/api/albums', fileUploadMiddleware, albumsRouter);
app.use('/api/settings', fileUploadMiddleware, settingsRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/auth', authRouter);
app.use('/api/backup', backupRouter);

export default app; 