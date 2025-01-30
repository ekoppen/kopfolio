-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    width INTEGER,
    height INTEGER,
    size INTEGER,
    mime_type VARCHAR(100),
    hash VARCHAR(255),
    album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
    taken_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 