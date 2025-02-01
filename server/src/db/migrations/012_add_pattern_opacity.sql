DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'pattern_opacity'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN pattern_opacity DECIMAL DEFAULT 0.8;

        UPDATE settings 
        SET pattern_opacity = 0.8
        WHERE id = 1;
    END IF;
END $$;