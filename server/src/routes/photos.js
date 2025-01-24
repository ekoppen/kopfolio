import express from 'express';
import { uploadPhotos, getPhotos, getPhotosByAlbum, updatePhoto, deletePhoto, checkDuplicates } from '../controllers/photos.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Publieke routes
router.get('/', getPhotos);
router.get('/album/:albumId', getPhotosByAlbum);

// Beveiligde routes
router.post('/check-duplicates', verifyToken, checkDuplicates);
router.post('/', verifyToken, uploadPhotos);
router.put('/:id', verifyToken, updatePhoto);
router.delete('/:id', verifyToken, deletePhoto);

export default router; 