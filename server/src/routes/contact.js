import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendContactFormEmail } from '../services/emailService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter: max 5 berichten per uur per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 uur
  max: 5,
  message: { error: 'Te veel berichten verzonden. Probeer het later opnieuw.' }
});

// Validatie middleware
const validateContactForm = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Naam moet tussen 2 en 100 tekens zijn'),
  body('email').trim().isEmail().withMessage('Ongeldig e-mailadres'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Bericht moet tussen 10 en 1000 tekens zijn')
];

router.post('/', contactLimiter, validateContactForm, async (req, res) => {
  try {
    // Controleer validatie resultaten
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    // Stuur e-mail
    await sendContactFormEmail({ name, email, message });

    res.json({ success: true, message: 'Bericht succesvol verzonden' });
  } catch (error) {
    console.error('Fout bij verwerken contactformulier:', error);
    res.status(500).json({ error: 'Fout bij verzenden bericht' });
  }
});

export default router; 