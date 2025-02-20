import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../models/db.js';

export const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check of gebruiker al bestaat
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Gebruikersnaam bestaat al' });
    }

    // Hash wachtwoord
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gebruiker opslaan
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    // JWT token genereren
    const token = jwt.sign(
      { id: result.rows[0].id, username: result.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Gebruiker succesvol geregistreerd',
      token,
      user: { id: result.rows[0].id, username: result.rows[0].username }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for user:', username);

  try {
    // Gebruiker zoeken
    console.log('Looking up user in database...');
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    console.log('Database query result:', {
      found: result.rows.length > 0,
      username: result.rows[0]?.username
    });

    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ message: 'Ongeldige inloggegevens' });
    }

    // Wachtwoord verifiëren
    console.log('Verifying password...');
    const validPassword = await bcrypt.compare(password, result.rows[0].password);
    console.log('Password verification result:', validPassword);
    
    if (!validPassword) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Ongeldige inloggegevens' });
    }

    // JWT token genereren
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { id: result.rows[0].id, username: result.rows[0].username, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('JWT token generated successfully');

    res.json({
      message: 'Succesvol ingelogd',
      token,
      user: { 
        id: result.rows[0].id, 
        username: result.rows[0].username,
        role: result.rows[0].role 
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 