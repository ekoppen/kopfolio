import bcrypt from 'bcryptjs';
import { pool } from '../models/db.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Haal alle gebruikers op
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, last_login, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fout bij ophalen gebruikers:', error);
    res.status(500).json({ error: 'Fout bij ophalen gebruikers' });
  }
};

// Maak een nieuwe gebruiker aan
export const createUser = async (req, res) => {
  const { username, password, email, full_name, role } = req.body;

  // Validatie
  if (!username || !password || !email || !full_name || !role) {
    return res.status(400).json({ error: 'Alle velden zijn verplicht' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Ongeldig e-mailadres' });
  }

  try {
    // Check of gebruikersnaam of email al bestaat
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Gebruikersnaam of e-mailadres bestaat al' });
    }

    // Hash het wachtwoord
    const hashedPassword = await bcrypt.hash(password, 10);

    // Voeg de gebruiker toe
    const result = await pool.query(
      'INSERT INTO users (username, password, email, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role',
      [username, hashedPassword, email, full_name, role]
    );

    // Stuur welkom e-mail
    await sendWelcomeEmail(result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fout bij aanmaken gebruiker:', error);
    res.status(500).json({ error: 'Fout bij aanmaken gebruiker' });
  }
};

// Update een gebruiker
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, full_name, role, password } = req.body;

  try {
    let query = 'UPDATE users SET email = $1, full_name = $2, role = $3, updated_at = CURRENT_TIMESTAMP';
    let values = [email, full_name, role];

    // Als er een nieuw wachtwoord is opgegeven
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $' + (values.length + 1);
      values.push(hashedPassword);
    }

    query += ' WHERE id = $' + (values.length + 1) + ' RETURNING id, username, email, full_name, role';
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fout bij updaten gebruiker:', error);
    res.status(500).json({ error: 'Fout bij updaten gebruiker' });
  }
};

// Verwijder een gebruiker
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Controleer of dit niet de laatste admin is
    const adminCount = await pool.query(
      'SELECT COUNT(*) FROM users WHERE role = $1',
      ['admin']
    );

    const userToDelete = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (userToDelete.rows[0].role === 'admin' && adminCount.rows[0].count <= 1) {
      return res.status(400).json({ error: 'Kan de laatste admin niet verwijderen' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json({ message: 'Gebruiker succesvol verwijderd' });
  } catch (error) {
    console.error('Fout bij verwijderen gebruiker:', error);
    res.status(500).json({ error: 'Fout bij verwijderen gebruiker' });
  }
}; 