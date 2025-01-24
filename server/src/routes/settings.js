import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Settings route werkt!' });
    console.log('Settings route werkt!');
});

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;  