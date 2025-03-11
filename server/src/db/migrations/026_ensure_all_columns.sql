DO $$
BEGIN
  -- Logo enabled kolom
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'settings' 
    AND column_name = 'logo_enabled'
  ) THEN
    ALTER TABLE settings
    ADD COLUMN logo_enabled BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Kolom logo_enabled toegevoegd aan settings tabel';
  END IF;

  -- Background opacity kolom
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'settings' 
    AND column_name = 'background_opacity'
  ) THEN
    ALTER TABLE settings
    ADD COLUMN background_opacity NUMERIC DEFAULT 1;
    RAISE NOTICE 'Kolom background_opacity toegevoegd aan settings tabel';
  END IF;

  -- Background color kolom
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'settings' 
    AND column_name = 'background_color'
  ) THEN
    ALTER TABLE settings
    ADD COLUMN background_color VARCHAR(50) DEFAULT NULL;
    RAISE NOTICE 'Kolom background_color toegevoegd aan settings tabel';
  END IF;

  -- Use dynamic background color kolom
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'settings' 
    AND column_name = 'use_dynamic_background_color'
  ) THEN
    ALTER TABLE settings
    ADD COLUMN use_dynamic_background_color BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Kolom use_dynamic_background_color toegevoegd aan settings tabel';
  END IF;

  -- Favicon kolom
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'settings' 
    AND column_name = 'favicon'
  ) THEN
    ALTER TABLE settings
    ADD COLUMN favicon TEXT;
    RAISE NOTICE 'Kolom favicon toegevoegd aan settings tabel';
  END IF;
END $$; 