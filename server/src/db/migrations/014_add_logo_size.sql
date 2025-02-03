DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'logo_size'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN logo_size INTEGER DEFAULT 60;

        UPDATE settings 
        SET logo_size = 60
        WHERE id = 1;
    END IF;
END $$; 