import express from 'express';
import { createAlbum, getAlbums, getAlbum, updateAlbum, deleteAlbum, addPhotosToAlbum, removePhotosFromAlbum } from '../controllers/albums.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Publieke routes
router.get('/', getAlbums);
router.get('/:id', getAlbum);

// Beveiligde routes
router.post('/', verifyToken, createAlbum);
router.put('/:id', verifyToken, updateAlbum);
router.delete('/:id', verifyToken, deleteAlbum);

// Foto beheer routes
router.post('/:id/photos', verifyToken, addPhotosToAlbum);
router.delete('/:id/photos', verifyToken, removePhotosFromAlbum);

export default router; 