DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE pages
        ADD COLUMN parent_id INTEGER REFERENCES pages(id) ON DELETE SET NULL;

        -- Index toevoegen voor sneller zoeken
        CREATE INDEX idx_pages_parent_id ON pages(parent_id);
    END IF;
END $$; 