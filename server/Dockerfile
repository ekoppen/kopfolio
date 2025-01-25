FROM node:18-alpine

WORKDIR /app

# Installeer PostgreSQL client tools
RUN apk add --no-cache postgresql-client

# Kopieer alleen package files voor betere cache benutting
COPY package*.json ./

# Installeer dependencies
RUN npm ci && npm install slugify

# Maak uploads directory en zet de juiste permissies
RUN mkdir -p /app/public/uploads && chmod 777 /app/public/uploads

# Kopieer de rest van de applicatie
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 