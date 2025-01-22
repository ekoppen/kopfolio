import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import photoRoutes from './routes/photos.js';
import albumRoutes from './routes/albums.js';
import pageRoutes from './routes/pages.js';
import { initDb } from './models/db.js';

// Environment variabelen laden
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('/app/public/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/pages', pageRoutes);

// Basis route
app.get('/', (req, res) => {
  res.json({ message: 'Welkom bij de Kopfolio API' });
});

// Database initialiseren
initDb().catch(console.error);

// Server starten
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
}); 