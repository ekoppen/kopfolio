-- Maak de settings tabel aan
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255),
  site_subtitle VARCHAR(255),
  accent_color VARCHAR(7),
  font VARCHAR(255),
  logo VARCHAR(255),
  logo_position VARCHAR(20) DEFAULT 'left',
  subtitle_font VARCHAR(255),
  subtitle_size INTEGER DEFAULT 16,
  subtitle_color VARCHAR(7),
  logo_margin_top INTEGER DEFAULT 0,
  logo_margin_left INTEGER DEFAULT 0,
  subtitle_margin_top INTEGER DEFAULT 0,
  subtitle_margin_left INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maak een trigger aan voor het bijwerken van updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Voeg standaard instellingen toe als deze nog niet bestaan
INSERT INTO settings (site_title, accent_color)
SELECT 'My Portfolio', '#000000'
WHERE NOT EXISTS (
  SELECT 1 FROM settings
); 