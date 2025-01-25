-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    content JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default about page if not exists
INSERT INTO pages (title, slug, description, content)
SELECT 'About', 'about', 'About me', '[]'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM pages WHERE slug = 'about'
);

-- Insert default home page if not exists
INSERT INTO pages (title, slug, description, content)
SELECT 'Home', 'home', 'Welkom op mijn portfolio', '[]'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM pages WHERE slug = 'home'
); 