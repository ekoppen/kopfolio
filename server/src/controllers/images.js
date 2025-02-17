import { getUploadPath } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Upload een nieuwe afbeelding
export const uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Geen afbeelding geüpload' });
    }

    const file = req.files.image;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Ongeldig bestandstype. Toegestane types: JPG, PNG, GIF, WEBP, SVG' 
      });
    }

    // Genereer een unieke bestandsnaam
    const extension = path.extname(file.name);
    const filename = `${uuidv4()}${extension}`;
    const uploadPath = getUploadPath('images', filename);

    await file.mv(uploadPath);

    res.json({
      success: true,
      filename,
      url: `/uploads/images/${filename}`
    });
  } catch (error) {
    console.error('Fout bij uploaden afbeelding:', error);
    res.status(500).json({ error: 'Fout bij uploaden afbeelding' });
  }
};

// Verwijder een afbeelding
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = getUploadPath('images', filename);

    await fs.unlink(filePath);
    
    res.json({ success: true, message: 'Afbeelding succesvol verwijderd' });
  } catch (error) {
    console.error('Fout bij verwijderen afbeelding:', error);
    res.status(500).json({ error: 'Fout bij verwijderen afbeelding' });
  }
};

// Haal alle afbeeldingen op
export const getImages = async (req, res) => {
  try {
    const imagesDir = getUploadPath('images');
    const files = await fs.readdir(imagesDir);
    
    const images = files.map(filename => ({
      filename,
      url: `/uploads/images/${filename}`
    }));

    res.json(images);
  } catch (error) {
    console.error('Fout bij ophalen afbeeldingen:', error);
    res.status(500).json({ error: 'Fout bij ophalen afbeeldingen' });
  }
}; 