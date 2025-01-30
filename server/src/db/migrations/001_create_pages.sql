-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    content JSONB,
    settings JSONB DEFAULT '{"slideshow": {"interval": 5000, "transition": "fade"}}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create home page if it doesn't exist
INSERT INTO pages (title, slug, description, content, settings)
VALUES (
    'Home',
    'home',
    'Welkom op mijn portfolio',
    '[]'::jsonb,
    '{"slideshow": {"interval": 5000, "transition": "fade"}}'::jsonb
)
ON CONFLICT (slug) DO NOTHING; 