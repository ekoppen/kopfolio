import jwt from 'jsonwebtoken';
import { pool } from '../models/db.js';

export const verifyToken = (req, res, next) => {
  console.log('Verifying token...');
  console.log('Headers:', req.headers);
  
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ error: 'Geen token aanwezig' });
  }

  try {
    console.log('Attempting to verify token with secret:', process.env.JWT_SECRET ? 'Present' : 'Missing');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Ongeldig token' });
  }
};

export const verifyAdmin = async (req, res, next) => {
  console.log('Verifying admin rights for user:', req.user);
  
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    if (result.rows[0].role !== 'admin') {
      console.log('User is not an admin');
      return res.status(403).json({ error: 'Alleen toegankelijk voor administrators' });
    }

    console.log('Admin rights verified successfully');
    next();
  } catch (error) {
    console.error('Error verifying admin rights:', error);
    res.status(500).json({ error: 'Fout bij verifiëren admin rechten' });
  }
}; 