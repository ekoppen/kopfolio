-- Create home album if it doesn't exist
INSERT INTO albums (title, slug, description, is_home)
VALUES (
    'Home',
    'home',
    'Welkom op mijn portfolio',
    TRUE
)
ON CONFLICT (slug) DO NOTHING; 