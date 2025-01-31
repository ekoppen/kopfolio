-- Add sidebar_pattern column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS sidebar_pattern VARCHAR(50) DEFAULT 'none';

-- Update existing settings
UPDATE settings SET sidebar_pattern = 'none' WHERE sidebar_pattern IS NULL; 