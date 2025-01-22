import express from 'express';
import { createPage, getPages, getPage, updatePage, deletePage } from '../controllers/pages.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Publieke routes
router.get('/', getPages);
router.get('/:slug', getPage);

// Beveiligde routes
router.post('/', verifyToken, createPage);
router.put('/:id', verifyToken, updatePage);
router.delete('/:id', verifyToken, deletePage);

export default router; 