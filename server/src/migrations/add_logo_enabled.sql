-- Voeg de logo_enabled kolom toe aan de settings tabel
ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_enabled BOOLEAN DEFAULT TRUE;

-- Update bestaande records om logo_enabled op true te zetten
UPDATE settings SET logo_enabled = TRUE WHERE logo_enabled IS NULL; 