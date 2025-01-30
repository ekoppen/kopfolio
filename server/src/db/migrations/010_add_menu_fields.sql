-- Add menu fields to pages table
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS menu_order INTEGER,
ADD COLUMN IF NOT EXISTS is_in_menu BOOLEAN DEFAULT false;

-- Update existing home page to be in menu by default
UPDATE pages 
SET is_in_menu = true, 
    menu_order = 0 
WHERE slug = 'home';

-- Create function to automatically manage menu_order
CREATE OR REPLACE FUNCTION update_menu_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Als een pagina uit het menu wordt gehaald
    IF OLD.is_in_menu = true AND NEW.is_in_menu = false THEN
        -- Verschuif alle hogere menu items naar boven
        UPDATE pages 
        SET menu_order = menu_order - 1
        WHERE menu_order > OLD.menu_order 
        AND is_in_menu = true;
        
        -- Reset menu_order van de huidige pagina
        NEW.menu_order = NULL;
    
    -- Als een pagina aan het menu wordt toegevoegd
    ELSIF OLD.is_in_menu = false AND NEW.is_in_menu = true THEN
        -- Als geen menu_order is opgegeven, zet het aan het eind
        IF NEW.menu_order IS NULL THEN
            SELECT COALESCE(MAX(menu_order) + 1, 0)
            INTO NEW.menu_order
            FROM pages
            WHERE is_in_menu = true;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for menu_order management
DROP TRIGGER IF EXISTS manage_menu_order ON pages;
CREATE TRIGGER manage_menu_order
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_order(); 