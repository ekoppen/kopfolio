ALTER TABLE settings
ADD COLUMN IF NOT EXISTS logo_margin_top integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS logo_margin_left integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtitle_margin_top integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtitle_margin_left integer DEFAULT 0;

UPDATE settings 
SET logo_margin_top = COALESCE(logo_margin_top, 0),
    logo_margin_left = COALESCE(logo_margin_left, 0),
    subtitle_margin_top = COALESCE(subtitle_margin_top, 0),
    subtitle_margin_left = COALESCE(subtitle_margin_left, 0)
WHERE id = 1; 