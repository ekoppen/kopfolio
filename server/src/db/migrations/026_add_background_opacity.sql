-- Voeg background_opacity kolom toe aan de settings tabel
ALTER TABLE settings ADD COLUMN IF NOT EXISTS background_opacity NUMERIC DEFAULT 1;

-- Update bestaande rijen om de standaardwaarde te gebruiken
UPDATE settings SET background_opacity = 1 WHERE background_opacity IS NULL;

-- Voeg een comment toe aan de kolom
COMMENT ON COLUMN settings.background_opacity IS 'Transparantie van de achtergrondkleur (0-1)'; 