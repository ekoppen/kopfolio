import express from 'express';
import { 
  createPage, 
  getPages, 
  getPage, 
  updatePage, 
  deletePage,
  updateSlideShowSettings,
  updateMenuOrder,
  updateSubOrder
} from '../controllers/pages.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Publieke routes
router.get('/', getPages);
router.get('/id/:id', getPage);
router.get('/:parentSlug/:slug', getPage);
router.get('/:slug', getPage);

// Beveiligde routes
router.post('/', verifyToken, createPage);
router.put('/:id', verifyToken, updatePage);
router.put('/:id/slideshow', verifyToken, updateSlideShowSettings);
router.put('/menu/order', verifyToken, updateMenuOrder);
router.put('/sub-order', verifyToken, updateSubOrder);
router.delete('/:id', verifyToken, deletePage);

export default router; 