import express from 'express';
import { getSettings, updateSettings, getPatterns, updateLogo } from '../controllers/settings.js';
import { verifyToken } from '../middleware/auth.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

// Voeg express.json middleware toe voor alle routes
router.use(express.json());

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Settings route werkt!' });
  console.log('Settings route werkt!');
});

// Publieke routes
router.get('/', getSettings);
router.get('/patterns', getPatterns);

// Beveiligde routes
router.put('/', verifyToken, updateSettings);

// Logo upload route met fileUpload middleware
router.put('/logo', verifyToken, fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
}), updateLogo);

export default router;  