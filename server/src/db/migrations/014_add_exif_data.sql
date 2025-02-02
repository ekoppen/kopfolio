DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'exif_data'
    ) THEN
        ALTER TABLE photos
        ADD COLUMN exif_data JSONB;
    END IF;
END $$; 