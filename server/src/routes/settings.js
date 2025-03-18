import express from 'express';
import { getSettings, updateSettings, getPatterns, updateLogo, updateFavicon, updateFaviconBase64, getFonts, uploadFont, getEmailSettings, updateEmailSettings, testEmailSettings } from '../controllers/settings.js';
import { verifyToken } from '../middleware/auth.js';
import { query } from 'express-validator';

const router = express.Router();

// Voeg express.json middleware toe voor alle routes
router.use(express.json());

// Publieke routes
router.get('/', getSettings);
router.get('/patterns', getPatterns);
router.get('/fonts', getFonts);
router.get('/email', getEmailSettings);

// Beschermde routes
router.put('/', verifyToken, updateSettings);
router.post('/logo', verifyToken, updateLogo);
router.post('/favicon', verifyToken, updateFavicon);
router.post('/favicon/base64', verifyToken, updateFaviconBase64);
router.post('/fonts', verifyToken, uploadFont);
router.put('/email', verifyToken, updateEmailSettings);
router.post('/email/test', verifyToken, testEmailSettings);

export default router;  