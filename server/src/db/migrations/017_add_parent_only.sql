DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'is_parent_only'
    ) THEN
        ALTER TABLE pages
        ADD COLUMN is_parent_only BOOLEAN DEFAULT false;

        -- Update bestaande records
        UPDATE pages 
        SET is_parent_only = false
        WHERE is_parent_only IS NULL;
    END IF;
END $$; 