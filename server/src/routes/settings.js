import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Settings route werkt!' });
    console.log('Settings route werkt!');
});

// Publieke route voor het ophalen van settings
router.get('/', getSettings);

// Beveiligde route voor het updaten van settings
router.put('/', verifyToken, updateSettings);

export default router;  