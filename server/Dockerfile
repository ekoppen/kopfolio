FROM node:20-alpine

WORKDIR /app

# Installeer PostgreSQL client tools
RUN apk add --no-cache postgresql-client

# Kopieer alleen package files voor betere cache benutting
COPY package*.json ./

# Installeer dependencies
RUN npm install

# Maak uploads en temp directories en zet de juiste permissies
RUN mkdir -p /app/public/uploads/photos \
    /app/public/uploads/thumbs \
    /app/public/uploads/branding \
    /app/temp && \
    chmod -R 777 /app/public/uploads /app/temp

# Kopieer de rest van de applicatie
COPY . .

EXPOSE 3000

CMD ["node", "src/start.js"] 