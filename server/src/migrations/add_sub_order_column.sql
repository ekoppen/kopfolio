-- Controleer of de sub_order kolom al bestaat
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
                   FROM information_schema.columns 
                   WHERE table_name='pages' AND column_name='sub_order') THEN
        -- Voeg de sub_order kolom toe
        ALTER TABLE pages ADD COLUMN sub_order INTEGER DEFAULT 0;

        -- Update bestaande records met een sub_order gebaseerd op hun huidige menu_order
        WITH RECURSIVE ordered_pages AS (
            SELECT id, parent_id, menu_order,
                   ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY menu_order) - 1 as new_sub_order
            FROM pages
            WHERE parent_id IS NOT NULL
        )
        UPDATE pages p
        SET sub_order = op.new_sub_order
        FROM ordered_pages op
        WHERE p.id = op.id;
    END IF;
END $$; 