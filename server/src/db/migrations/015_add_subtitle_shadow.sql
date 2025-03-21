DO $$
BEGIN
    -- Voeg dropshadow kolommen toe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' 
        AND column_name = 'subtitle_shadow_enabled'
    ) THEN
        ALTER TABLE settings
        ADD COLUMN subtitle_shadow_enabled BOOLEAN DEFAULT false,
        ADD COLUMN subtitle_shadow_x INTEGER DEFAULT 0,
        ADD COLUMN subtitle_shadow_y INTEGER DEFAULT 0,
        ADD COLUMN subtitle_shadow_blur INTEGER DEFAULT 0,
        ADD COLUMN subtitle_shadow_color VARCHAR(7) DEFAULT '#000000',
        ADD COLUMN subtitle_shadow_opacity DECIMAL(3,2) DEFAULT 0.20;

        -- Update bestaande instellingen
        UPDATE settings 
        SET 
            subtitle_shadow_enabled = false,
            subtitle_shadow_x = 0,
            subtitle_shadow_y = 0,
            subtitle_shadow_blur = 0,
            subtitle_shadow_color = '#000000',
            subtitle_shadow_opacity = 0.20
        WHERE id = 1;
    END IF;
END $$; 