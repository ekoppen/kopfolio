-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    site_title VARCHAR(255),
    site_subtitle VARCHAR(255),
    subtitle_font VARCHAR(100),
    subtitle_size INTEGER,
    subtitle_color VARCHAR(50),
    accent_color VARCHAR(50),
    font VARCHAR(100),
    logo VARCHAR(255),
    logo_position VARCHAR(50),
    logo_margin_top INTEGER,
    logo_margin_left INTEGER,
    subtitle_margin_top INTEGER,
    subtitle_margin_left INTEGER,
    footer_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add settings column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS settings JSONB; 