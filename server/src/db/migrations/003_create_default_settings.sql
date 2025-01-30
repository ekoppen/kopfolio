-- Insert default settings if they don't exist
INSERT INTO settings (
    site_title,
    site_subtitle,
    subtitle_font,
    subtitle_size,
    subtitle_color,
    accent_color,
    font,
    logo,
    logo_position,
    logo_margin_top,
    logo_margin_left,
    subtitle_margin_top,
    subtitle_margin_left,
    footer_text,
    created_at,
    updated_at
)
SELECT
    'Kopfolio',
    'Jouw Fotoportfolio',
    'Roboto',
    16,
    '#FFFFFF',
    '#000000',
    'Roboto',
    'default-logo.png',
    'left',
    20,
    20,
    0,
    0,
    '© 2024 Kopfolio',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM settings WHERE id = 1
); 