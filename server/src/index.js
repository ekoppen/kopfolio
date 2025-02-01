import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/photos.js';
import albumRoutes from './routes/albums.js';
import settingsRoutes from './routes/settings.js';
import pageRoutes from './routes/pages.js';
import app from './app.js';
import { initDb } from './models/db.js';

// Environment variabelen laden
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/patterns', express.static(path.join(__dirname, '../public/patterns')));

// Basis route
app.get('/', (req, res) => {
  res.json({ message: 'Welkom bij de Kopfolio API' });
});

// Initialize database and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server draait op poort ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Fout bij opstarten server:', error);
  }); 