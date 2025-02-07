DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'is_fullscreen_slideshow'
    ) THEN
        ALTER TABLE pages
        ADD COLUMN is_fullscreen_slideshow BOOLEAN DEFAULT false;

        -- Update bestaande records
        UPDATE pages 
        SET is_fullscreen_slideshow = false
        WHERE is_fullscreen_slideshow IS NULL;
    END IF;
END $$; 