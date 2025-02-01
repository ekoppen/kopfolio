DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'pattern_scale'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN pattern_scale DECIMAL DEFAULT 1.0;

        UPDATE settings 
        SET pattern_scale = 1.0
        WHERE id = 1;
    END IF;
END $$;