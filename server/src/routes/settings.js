import express from 'express';
import { getSettings, updateSettings, getPatterns, updateLogo, updateFavicon, updateFaviconBase64, getFonts, uploadFont, getEmailSettings, updateEmailSettings, testEmailSettings } from '../controllers/settings.js';
import { verifyToken } from '../middleware/auth.js';
import fileUpload from 'express-fileupload';
import { query } from 'express-validator';

const router = express.Router();

// Voeg express.json middleware toe voor alle routes
router.use(express.json());

// Middleware voor bestandsuploads
router.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limiet
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Settings route werkt!' });
  console.log('Settings route werkt!');
});

// Publieke routes
router.get('/', getSettings);
router.get('/patterns', getPatterns);
router.get('/fonts', getFonts);

// Beveiligde routes
router.put('/', verifyToken, updateSettings);

// Logo upload route met fileUpload middleware
router.post('/logo', verifyToken, updateLogo);

// Favicon upload route
router.post('/favicon', verifyToken, updateFavicon);
router.post('/favicon-base64', verifyToken, updateFaviconBase64);

// Font upload route
router.post('/fonts', verifyToken, uploadFont);

// E-mail instellingen routes
router.get('/email', verifyToken, getEmailSettings);
router.put('/email', verifyToken, updateEmailSettings);
router.post('/email/test', verifyToken, testEmailSettings);

export default router;  