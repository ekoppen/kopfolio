-- Verwijder bestaande demo foto's
DELETE FROM photos_albums WHERE photo_id IN (
    SELECT id FROM photos WHERE filename LIKE 'demo%.jpg'
);
DELETE FROM photos WHERE filename LIKE 'demo%.jpg';

-- Insert sample photos
WITH new_photos AS (
    INSERT INTO photos (
        filename,
        original_filename,
        title,
        description,
        width,
        height,
        size,
        mime_type
    ) VALUES 
    ('demo1.jpg', 'demo1.jpg', 'Demo Foto 1', 'Een mooie demo foto', 1920, 1080, 500000, 'image/jpeg'),
    ('demo2.jpg', 'demo2.jpg', 'Demo Foto 2', 'Nog een mooie demo foto', 1920, 1080, 500000, 'image/jpeg'),
    ('demo3.jpg', 'demo3.jpg', 'Demo Foto 3', 'En nog een mooie demo foto', 1920, 1080, 500000, 'image/jpeg')
    RETURNING id
),
home_album AS (
    SELECT id FROM albums WHERE is_home = TRUE LIMIT 1
)
INSERT INTO photos_albums (photo_id, album_id)
SELECT new_photos.id, home_album.id
FROM new_photos, home_album; 