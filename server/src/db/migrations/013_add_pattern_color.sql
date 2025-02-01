DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'pattern_color'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN pattern_color VARCHAR(7) DEFAULT '#FCF4FF';

        UPDATE settings 
        SET pattern_color = '#FCF4FF'
        WHERE id = 1;
    END IF;
END $$; 