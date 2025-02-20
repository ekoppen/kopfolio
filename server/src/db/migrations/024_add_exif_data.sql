-- Add exif_data column to photos table
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS exif_data JSONB; 