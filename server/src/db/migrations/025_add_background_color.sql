DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'background_color'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN background_color VARCHAR(50) DEFAULT NULL;

        -- Update bestaande instellingen
        UPDATE settings 
        SET background_color = NULL
        WHERE id = 1;
    END IF;
END $$; 