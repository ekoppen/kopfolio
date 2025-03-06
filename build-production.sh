#!/bin/bash

# Stop alle containers
echo "Stopping all containers..."
docker-compose down

# Bouw de frontend voor productie
echo "Building frontend for production..."
cd client
npm run build
cd ..

# Start de productie containers
echo "Starting production containers..."
docker-compose -f docker-compose.production.yml up -d

echo "Production environment is now running!"
echo "Access your application at http://192.168.20.10" 