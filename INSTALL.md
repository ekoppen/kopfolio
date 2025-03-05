# Kopfolio Installatie Handleiding

Deze handleiding bevat gedetailleerde instructies voor het installeren en configureren van Kopfolio, een moderne fotoportfolio applicatie.

## Inhoudsopgave

- [Vereisten](#vereisten)
- [Installatiemethoden](#installatiemethoden)
  - [Standaard Installatie](#standaard-installatie)
  - [Docker Installatie](#docker-installatie)
- [Database Configuratie](#database-configuratie)
  - [PostgreSQL](#postgresql)
  - [SQLite (voor ontwikkeling)](#sqlite-voor-ontwikkeling)
- [Omgevingsvariabelen](#omgevingsvariabelen)
- [Eerste Configuratie](#eerste-configuratie)
- [Productie Deployment](#productie-deployment)
- [Probleemoplossing](#probleemoplossing)

## Vereisten

Voordat je begint met de installatie, zorg ervoor dat je systeem aan de volgende vereisten voldoet:

### Systeemvereisten
- **Besturingssysteem**: Linux, macOS of Windows
- **RAM**: Minimaal 2GB (4GB aanbevolen)
- **Schijfruimte**: Minimaal 1GB voor de applicatie, plus ruimte voor foto's

### Software Vereisten
- **Node.js**: v16.0.0 of hoger
- **npm**: v7.0.0 of hoger (of yarn)
- **PostgreSQL**: v13.0 of hoger (voor productie)
- **Git**: Voor het klonen van de repository

Je kunt de versies controleren met de volgende commando's:
```bash
node -v
npm -v
git --version
psql --version  # Voor PostgreSQL
```

## Installatiemethoden

### Standaard Installatie

Volg deze stappen voor een standaard installatie:

1. **Clone de repository**:
   ```bash
   git clone https://github.com/[username]/kopfolio.git
   cd kopfolio
   ```

2. **Installeer dependencies**:
   ```bash
   # Root dependencies
   npm install

   # Backend dependencies
   cd server
   npm install

   # Frontend dependencies
   cd ../client
   npm install
   ```

3. **Configureer de database**:
   
   Maak een nieuwe PostgreSQL database aan:
   ```bash
   psql -U postgres
   CREATE DATABASE kopfolio;
   CREATE USER kopfolio WITH ENCRYPTED PASSWORD 'jouw_wachtwoord';
   GRANT ALL PRIVILEGES ON DATABASE kopfolio TO kopfolio;
   \q
   ```

4. **Maak omgevingsvariabelen aan**:
   
   Maak een `.env` bestand aan in de `server` directory:
   ```env
   # Database configuratie
   DB_HOST=localhost
   DB_USER=kopfolio
   DB_PASSWORD=jouw_wachtwoord
   DB_NAME=kopfolio
   DB_DIALECT=postgres

   # JWT configuratie
   JWT_SECRET=jouw_jwt_geheim
   JWT_EXPIRATION=24h

   # Email configuratie (optioneel)
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=jouw_email@example.com
   EMAIL_PASS=jouw_email_wachtwoord
   EMAIL_FROM=noreply@jouwdomein.com

   # Server configuratie
   PORT=3000
   NODE_ENV=development
   ```

   Maak een `.env` bestand aan in de `client` directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

5. **Initialiseer de database**:
   ```bash
   # Vanuit de server directory
   cd ../server
   npm run db:init
   ```

6. **Start de development servers**:
   ```bash
   # Start backend (vanuit server directory)
   npm run dev

   # Start frontend (vanuit client directory, in een nieuwe terminal)
   cd ../client
   npm run dev
   ```

7. **Open de applicatie**:
   
   Open je browser en ga naar `http://localhost:5173` (of de poort die Vite aangeeft)

### Docker Installatie

Voor een snellere installatie met Docker:

1. **Clone de repository**:
   ```bash
   git clone https://github.com/[username]/kopfolio.git
   cd kopfolio
   ```

2. **Configureer omgevingsvariabelen** (optioneel):
   
   Je kunt de standaard configuratie in `docker-compose.yml` aanpassen indien nodig.

3. **Start de containers**:
   ```bash
   docker-compose up --build
   ```

4. **Open de applicatie**:
   
   Open je browser en ga naar `http://localhost:5173`

## Database Configuratie

### PostgreSQL

Voor productieomgevingen raden we PostgreSQL aan:

1. **Installeer PostgreSQL**:
   
   **Ubuntu/Debian**:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```
   
   **macOS** (met Homebrew):
   ```bash
   brew install postgresql
   brew services start postgresql
   ```
   
   **Windows**:
   Download en installeer vanaf [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Maak een database en gebruiker aan**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE kopfolio;
   CREATE USER kopfolio WITH ENCRYPTED PASSWORD 'jouw_wachtwoord';
   GRANT ALL PRIVILEGES ON DATABASE kopfolio TO kopfolio;
   \q
   ```

3. **Configureer de verbinding**:
   
   Zorg ervoor dat de volgende instellingen in je `.env` bestand staan:
   ```env
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=kopfolio
   DB_PASSWORD=jouw_wachtwoord
   DB_NAME=kopfolio
   ```

### SQLite (voor ontwikkeling)

Voor ontwikkeling kun je SQLite gebruiken, wat geen aparte installatie vereist:

1. **Configureer SQLite**:
   
   Pas je `.env` bestand aan:
   ```env
   DB_DIALECT=sqlite
   DB_STORAGE=./database.sqlite
   ```

2. **Initialiseer de database**:
   ```bash
   cd server
   npm run db:init
   ```

## Omgevingsvariabelen

### Server Omgevingsvariabelen

| Variabele | Beschrijving | Voorbeeld |
|-----------|-------------|-----------|
| `DB_DIALECT` | Database type | `postgres` of `sqlite` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database poort | `5432` |
| `DB_USER` | Database gebruiker | `kopfolio` |
| `DB_PASSWORD` | Database wachtwoord | `jouw_wachtwoord` |
| `DB_NAME` | Database naam | `kopfolio` |
| `DB_STORAGE` | SQLite bestandspad | `./database.sqlite` |
| `JWT_SECRET` | Geheim voor JWT tokens | `jouw_jwt_geheim` |
| `JWT_EXPIRATION` | JWT token vervaltijd | `24h` |
| `EMAIL_HOST` | SMTP server | `smtp.example.com` |
| `EMAIL_PORT` | SMTP poort | `587` |
| `EMAIL_USER` | SMTP gebruiker | `jouw_email@example.com` |
| `EMAIL_PASS` | SMTP wachtwoord | `jouw_email_wachtwoord` |
| `EMAIL_FROM` | Afzender e-mail | `noreply@jouwdomein.com` |
| `PORT` | Server poort | `3000` |
| `NODE_ENV` | Omgeving | `development` of `production` |

### Client Omgevingsvariabelen

| Variabele | Beschrijving | Voorbeeld |
|-----------|-------------|-----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

## Eerste Configuratie

Na de installatie kun je inloggen met de standaard admin account:

- **Gebruikersnaam**: admin@example.com
- **Wachtwoord**: admin123

**Belangrijk**: Wijzig dit wachtwoord onmiddellijk na je eerste login!

Volg deze stappen voor de eerste configuratie:

1. **Login**:
   - Ga naar `http://localhost:5173/admin`
   - Log in met de standaard credentials

2. **Wijzig het admin wachtwoord**:
   - Ga naar "Gebruikers" in het admin menu
   - Klik op je gebruiker
   - Wijzig het wachtwoord

3. **Configureer site-instellingen**:
   - Ga naar "Instellingen" in het admin menu
   - Configureer site titel, beschrijving en logo
   - Pas thema-instellingen aan

4. **Voeg content toe**:
   - Upload foto's
   - Maak albums aan
   - Maak pagina's aan

## Productie Deployment

Voor een productie-omgeving raden we de volgende stappen aan:

1. **Bouw de frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Configureer de server**:
   
   Pas je `.env` bestand aan:
   ```env
   NODE_ENV=production
   ```

3. **Start de server**:
   ```bash
   cd ../server
   npm start
   ```

4. **Gebruik een reverse proxy**:
   
   Configureer Nginx of Apache als reverse proxy voor betere prestaties en beveiliging.

   **Nginx voorbeeld configuratie**:
   ```nginx
   server {
       listen 80;
       server_name jouwdomein.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Configureer SSL**:
   
   Gebruik Let's Encrypt voor gratis SSL-certificaten:
   ```bash
   sudo certbot --nginx -d jouwdomein.com
   ```

## Probleemoplossing

### Veelvoorkomende problemen

1. **Database verbindingsproblemen**:
   - Controleer of PostgreSQL draait: `sudo service postgresql status`
   - Controleer de database credentials in je `.env` bestand
   - Controleer of de database bestaat: `psql -U postgres -c "\l"`

2. **Node.js versie problemen**:
   - Gebruik nvm om de juiste Node.js versie te installeren: `nvm install 16`
   - Controleer je Node.js versie: `node -v`

3. **Poort al in gebruik**:
   - Wijzig de poort in je `.env` bestand
   - Controleer welk proces de poort gebruikt: `lsof -i :3000`

4. **Bestandsrechten problemen**:
   - Zorg ervoor dat de uploads directory schrijfbaar is: `chmod -R 755 content/uploads`

### Logbestanden

Controleer de volgende logbestanden voor meer informatie:

- **Server logs**: In de terminal waar je `npm run dev` uitvoert
- **Client logs**: In de terminal waar je de frontend draait
- **Browser console**: Open de developer tools in je browser (F12)

### Ondersteuning

Als je problemen ondervindt die niet in deze handleiding worden behandeld:

1. Controleer de [GitHub issues](https://github.com/[username]/kopfolio/issues)
2. Maak een nieuw issue aan met een gedetailleerde beschrijving van je probleem
3. Voeg relevante logbestanden en omgevingsinformatie toe 