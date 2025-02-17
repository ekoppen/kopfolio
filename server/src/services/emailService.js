import nodemailer from 'nodemailer';

// Maak een SMTP transporter aan
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true voor 465, false voor andere ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (user) => {
  try {
    const msg = {
      from: `"Kopfolio" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Welkom bij Kopfolio',
      text: `Beste ${user.full_name},\n\nWelkom bij Kopfolio! Je account is succesvol aangemaakt.\n\nGebruikersnaam: ${user.username}\nRol: ${user.role}\n\nJe kunt nu inloggen op de website.\n\nMet vriendelijke groet,\nHet Kopfolio Team`,
      html: `
        <h2>Welkom bij Kopfolio!</h2>
        <p>Beste ${user.full_name},</p>
        <p>Je account is succesvol aangemaakt.</p>
        <p><strong>Gebruikersnaam:</strong> ${user.username}<br>
        <strong>Rol:</strong> ${user.role}</p>
        <p>Je kunt nu inloggen op de website.</p>
        <p>Met vriendelijke groet,<br>Het Kopfolio Team</p>
      `
    };
    await transporter.sendMail(msg);
    console.log('Welkom e-mail verzonden naar:', user.email);
  } catch (error) {
    console.error('Fout bij verzenden welkom e-mail:', error);
    // We gooien de error niet, omdat het verzenden van de e-mail niet kritiek is
  }
};

export const sendContactFormEmail = async (formData) => {
  try {
    const msg = {
      from: `"Kopfolio Contact" <${process.env.EMAIL_FROM}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: formData.email,
      subject: `Nieuw contactformulier bericht van ${formData.name}`,
      text: `Naam: ${formData.name}\nE-mail: ${formData.email}\nBericht:\n\n${formData.message}`,
      html: `
        <h2>Nieuw contactformulier bericht</h2>
        <p><strong>Naam:</strong> ${formData.name}</p>
        <p><strong>E-mail:</strong> ${formData.email}</p>
        <p><strong>Bericht:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
      `
    };
    await transporter.sendMail(msg);
    console.log('Contact formulier e-mail verzonden');
    return true;
  } catch (error) {
    console.error('Fout bij verzenden contact formulier:', error);
    throw error;
  }
}; 