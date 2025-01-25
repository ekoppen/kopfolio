-- Voeg nieuwe kolommen toe voor subtitel opmaak
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS subtitle_font varchar(50),
ADD COLUMN IF NOT EXISTS subtitle_size integer,
ADD COLUMN IF NOT EXISTS subtitle_color varchar(7);

-- Update bestaande rij met standaard waardes als de kolommen NULL zijn
UPDATE settings 
SET 
  subtitle_font = COALESCE(subtitle_font, 'Roboto'),
  subtitle_size = COALESCE(subtitle_size, 14),
  subtitle_color = COALESCE(subtitle_color, '#FFFFFF')
WHERE id = 1; 