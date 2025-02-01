#!/bin/sh

# Wacht tot de database beschikbaar is
echo "Wachten op database..."
while ! pg_isready -h $DB_HOST -U $DB_USER
do
  sleep 1
done

# Maak de benodigde mappen aan
mkdir -p /app/public/uploads/photos \
         /app/public/uploads/thumbs \
         /app/public/uploads/branding

# Kopieer demo foto's als ze nog niet bestaan
if [ ! -f /app/public/uploads/photos/demo1.jpg ]; then
  echo "Kopiëren van demo foto's..."
  cp -r /app/demo-images/* /app/public/uploads/photos/
fi

# Genereer thumbnails
echo "Genereren van thumbnails..."
node src/scripts/generate-thumbnails.js

# Start de applicatie
echo "Starten van de applicatie..."
npm run dev 