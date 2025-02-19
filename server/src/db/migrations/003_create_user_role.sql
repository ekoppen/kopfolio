DO $$
BEGIN
    -- Drop bestaande enum type als deze bestaat
    DROP TYPE IF EXISTS user_role CASCADE;
    
    -- Maak het enum type aan
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
END $$; 