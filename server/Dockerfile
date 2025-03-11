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
    /app/public/patterns \
    /app/temp && \
    chmod -R 777 /app/public/uploads /app/public/patterns /app/temp

# Kopieer de rest van de applicatie
COPY . .

# Maak scripts directory aan
RUN mkdir -p /app/src/scripts

EXPOSE 3000

CMD ["node", "src/start.js"] 