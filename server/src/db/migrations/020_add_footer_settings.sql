DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'footer_font'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN footer_font VARCHAR(255),
        ADD COLUMN footer_size INTEGER,
        ADD COLUMN footer_color VARCHAR(255);

        -- Update bestaande instellingen
        UPDATE settings 
        SET footer_font = 'system-ui',
            footer_size = 14,
            footer_color = '#666666'
        WHERE id = 1;
    END IF;
END $$; 