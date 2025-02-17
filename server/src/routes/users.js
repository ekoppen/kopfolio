import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// Alle routes vereisen authenticatie en admin rechten
router.use(verifyToken, verifyAdmin);

// Haal alle gebruikers op
router.get('/', getUsers);

// Maak een nieuwe gebruiker aan
router.post('/', createUser);

// Update een gebruiker
router.put('/:id', updateUser);

// Verwijder een gebruiker
router.delete('/:id', deleteUser);

export default router; 