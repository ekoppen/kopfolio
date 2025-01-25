-- Voeg nieuwe kolommen toe aan de settings tabel
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS site_subtitle varchar(255),
ADD COLUMN IF NOT EXISTS logo_position varchar(50) DEFAULT 'left';

-- Update bestaande rij of voeg nieuwe toe als deze niet bestaat
INSERT INTO settings (site_title, site_subtitle, accent_color, font, logo_position)
VALUES ('Mijn Portfolio', NULL, '#000000', 'Roboto', 'left')
ON CONFLICT (id) DO UPDATE 
SET site_subtitle = EXCLUDED.site_subtitle,
    logo_position = EXCLUDED.logo_position
WHERE settings.site_subtitle IS NULL 
   OR settings.logo_position IS NULL; 