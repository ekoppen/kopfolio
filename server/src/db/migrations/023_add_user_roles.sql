DO $$
BEGIN
    -- Drop bestaande enum type als deze bestaat
    DROP TYPE IF EXISTS user_role CASCADE;
    
    -- Maak het enum type aan
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

    -- Voeg role kolom toe als deze nog niet bestaat
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role user_role DEFAULT 'viewer';
    END IF;

    -- Voeg email kolom toe als deze nog niet bestaat
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
    END IF;

    -- Voeg full_name kolom toe als deze nog niet bestaat
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
    END IF;

    -- Voeg last_login kolom toe als deze nog niet bestaat
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;

    -- Voeg created_at kolom toe als deze nog niet bestaat
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Voeg updated_at kolom toe als deze nog niet bestaat
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Update bestaande admin gebruiker met admin rol
    UPDATE users 
    SET role = 'admin'::user_role
    WHERE username = 'admin'
    AND role IS NULL;

END $$; 