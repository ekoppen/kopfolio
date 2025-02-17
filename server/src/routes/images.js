import express from 'express';
import { uploadImage, deleteImage, getImages } from '../controllers/images.js';
import { verifyToken } from '../middleware/auth.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

// Voeg fileUpload middleware toe voor upload routes
router.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limiet
  },
  abortOnLimit: true
}));

// Publieke route voor het ophalen van afbeeldingen
router.get('/', getImages);

// Beveiligde routes voor beheer
router.post('/', verifyToken, uploadImage);
router.delete('/:filename', verifyToken, deleteImage);

export default router; 