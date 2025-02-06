DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'menu_font_size'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN menu_font_size INTEGER DEFAULT 16,
        ADD COLUMN content_font_size INTEGER DEFAULT 16;

        -- Update bestaande instellingen
        UPDATE settings 
        SET menu_font_size = 16,
            content_font_size = 16
        WHERE id = 1;
    END IF;
END $$; 