import jwt from 'jsonwebtoken';
import { pool } from '../models/db.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Geen token aanwezig' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ongeldig token' });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Alleen toegankelijk voor administrators' });
    }

    next();
  } catch (error) {
    console.error('Fout bij verifiëren admin rechten:', error);
    res.status(500).json({ error: 'Fout bij verifiëren admin rechten' });
  }
}; 