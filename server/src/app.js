import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pagesRouter from './routes/pages.js';
import photosRouter from './routes/photos.js';
import albumsRouter from './routes/albums.js';
import settingsRouter from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Static files
app.use('/uploads', express.static(join(__dirname, '../public/uploads')));

// Routes
app.use('/api/pages', pagesRouter);
app.use('/api/photos', photosRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/settings', settingsRouter);

export default app; 