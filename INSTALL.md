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
- [Cross-Platform Compatibiliteit](#cross-platform-compatibiliteit)
- [Probleemoplossing](#probleemoplossing)
- [Database Migraties](#database-migraties)
  - [Automatische Migraties](#automatische-migraties)
  - [Handmatige Migraties](#handmatige-migraties)
  - [Nieuwe Migraties Toevoegen](#nieuwe-migraties-toevoegen)

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
| `DB_HOST` | Database host | `localhost` of `db` (voor Docker) |
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

| Variabele | Beschrijving | Voorbeeld voor lokale ontwikkeling | Voorbeeld voor productie |
|-----------|-------------|-----------|-----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` | `/api` (relatief pad voor productie) |

### Vite Proxy Configuratie

Voor ontwikkeling met Docker is het belangrijk om de Vite proxy correct te configureren in `client/vite.config.js`. Zorg ervoor dat alle benodigde routes worden doorgestuurd naar de backend server:

```javascript
server: {
  host: true,
  port: 5173,
  watch: {
    usePolling: true
  },
  proxy: {
    '/api': {
      target: 'http://backend:3000',
      changeOrigin: true
    },
    '/uploads': {
      target: 'http://backend:3000',
      changeOrigin: true
    },
    '/patterns': {
      target: 'http://backend:3000',
      changeOrigin: true
    },
    '/fonts': {
      target: 'http://backend:3000',
      changeOrigin: true
    }
  }
},
```

Deze configuratie zorgt ervoor dat alle benodigde assets correct worden doorgestuurd naar de backend server:

- **API verzoeken**: Alle verzoeken naar `/api` worden doorgestuurd naar de backend
- **Uploads**: Afbeeldingen en andere geüploade bestanden worden correct geladen
- **Patronen**: SVG patronen voor de achtergrond worden correct geladen in de instellingen
- **Fonts**: Custom fonts worden correct geladen voor de website

**Belangrijk**: Als je problemen ondervindt met het laden van bepaalde assets (zoals patronen of fonts niet zichtbaar in de instellingen), controleer dan of de juiste proxy routes zijn geconfigureerd.

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

### Standaard Deployment

Voor een standaard productie-omgeving:

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

   Pas je client `.env` bestand aan voor relatieve API paden:
   ```env
   VITE_API_URL=/api
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

       # Frontend bestanden
       location / {
           root /pad/naar/kopfolio/client/dist;
           try_files $uri $uri/ /index.html;
           index index.html;
       }

       # API proxy
       location /api/ {
           proxy_pass http://localhost:3000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Uploads en statische bestanden
       location /uploads/ {
           alias /pad/naar/kopfolio/content/uploads/;
       }

       location /patterns/ {
           alias /pad/naar/kopfolio/content/patterns/;
       }

       location /fonts/ {
           alias /pad/naar/kopfolio/content/fonts/;
       }
   }
   ```

5. **Configureer SSL**:
   
   Gebruik Let's Encrypt voor gratis SSL-certificaten:
   ```bash
   sudo certbot --nginx -d jouwdomein.com
   ```

### Docker Productie Deployment

Voor een Docker-gebaseerde productie-omgeving:

1. **Maak een productie Docker Compose bestand**:

   Maak een bestand genaamd `docker-compose.production.yml`:
   ```yaml
   version: '3.8'

   services:
     frontend:
       build: 
         context: ./client
         dockerfile: Dockerfile
       ports:
         - "5173:5173"
       volumes:
         - ./client:/app
         - /app/node_modules
       environment:
         - VITE_API_URL=/api
       depends_on:
         - backend
       networks:
         - app-network

     backend:
       build: 
         context: ./server
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       volumes:
         - ./server:/app
         - /app/node_modules
         - ./content/uploads:/app/public/uploads:delegated
         - ./content/patterns:/app/public/patterns:delegated
         - ./content/fonts:/app/public/fonts:delegated
         - uploads_data:/app/public/uploads
       environment:
         - DB_HOST=db
         - DB_USER=kopfolio
         - DB_PASSWORD=kopfolio
         - DB_NAME=kopfolio
         - JWT_SECRET=your-secret-key
       depends_on:
         db:
           condition: service_healthy
       networks:
         - app-network

     db:
       image: postgres:16-alpine
       environment:
         - POSTGRES_USER=kopfolio
         - POSTGRES_PASSWORD=kopfolio
         - POSTGRES_DB=kopfolio
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U kopfolio"]
         interval: 5s
         timeout: 5s
         retries: 5
       networks:
         - app-network

     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
       volumes:
         - ./nginx.conf.production:/etc/nginx/conf.d/default.conf
         - ./client/dist:/usr/share/nginx/html
         - ./content/uploads:/usr/share/nginx/html/uploads
         - ./content/patterns:/usr/share/nginx/html/patterns
         - ./content/fonts:/usr/share/nginx/html/fonts
       depends_on:
         - frontend
         - backend
       networks:
         - app-network

   networks:
     app-network:
       driver: bridge

   volumes:
     postgres_data:
     uploads_data:
   ```

2. **Maak een Nginx configuratie voor productie**:

   Maak een bestand genaamd `nginx.conf.production`:
   ```nginx
   server {
       listen 80;
       server_name jouwdomein.com;  # Vervang dit door je eigen domeinnaam

       # Frontend bestanden
       location / {
           root /usr/share/nginx/html;
           try_files $uri $uri/ /index.html;
           index index.html;
       }

       # API proxy
       location /api/ {
           proxy_pass http://backend:3000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Maak een build script voor productie**:

   Maak een bestand genaamd `build-production.sh`:
   ```bash
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
   echo "Access your application at http://jouwdomein.com"
   ```

   Maak het script uitvoerbaar:
   ```bash
   chmod +x build-production.sh
   ```

4. **Start de productie-omgeving**:
   ```bash
   ./build-production.sh
   ```

## Cross-Platform Compatibiliteit

Bij het werken met Kopfolio op verschillende besturingssystemen, houd rekening met het volgende:

### Bestandsnamen en Hoofdlettergevoeligheid

- **Linux/Unix**: Bestandssystemen zijn hoofdlettergevoelig (bijv. `Routes.jsx` en `routes.jsx` zijn verschillende bestanden)
- **macOS**: Standaard niet hoofdlettergevoelig, maar kan hoofdlettergevoelig zijn afhankelijk van het bestandssysteem
- **Windows**: Niet hoofdlettergevoelig

Zorg ervoor dat imports in je code exact overeenkomen met de bestandsnamen, inclusief hoofdletters:

```javascript
// Correct (als het bestand Routes.jsx heet)
import AppRoutes from './Routes';

// Fout op Linux/Unix (als het bestand Routes.jsx heet)
import AppRoutes from './routes';
```

### Paden en Slashes

- **Linux/Unix/macOS**: Gebruikt forward slashes (`/`) in paden
- **Windows**: Gebruikt backslashes (`\`) in paden, maar JavaScript accepteert ook forward slashes

Gebruik in je code altijd forward slashes voor paden, ongeacht het besturingssysteem:

```javascript
// Correct voor alle platforms
const path = './uploads/images/photo.jpg';

// Kan problemen veroorzaken op sommige platforms
const path = '.\\uploads\\images\\photo.jpg';
```

## Probleemoplossing

### Veelvoorkomende problemen

1. **Database verbindingsproblemen**:
   - Controleer of PostgreSQL draait: `sudo service postgresql status`
   - Controleer de database credentials in je `.env` bestand
   - Controleer of de database bestaat: `psql -U postgres -c "\l"`
   - Voor Docker: zorg ervoor dat `DB_HOST=db` is ingesteld in plaats van `localhost`

2. **Node.js versie problemen**:
   - Gebruik nvm om de juiste Node.js versie te installeren: `nvm install 16`
   - Controleer je Node.js versie: `node -v`

3. **Poort al in gebruik**:
   - Wijzig de poort in je `.env` bestand
   - Controleer welk proces de poort gebruikt: `lsof -i :3000`

4. **Bestandsrechten problemen**:
   - Zorg ervoor dat de uploads directory schrijfbaar is: `chmod -R 755 content/uploads`

5. **API URL problemen**:
   - **Localhost verwijzingen in productie**: Wijzig `VITE_API_URL` in client/.env naar `/api` in plaats van `http://localhost:3000/api`
   - **CORS fouten**: Zorg ervoor dat de API en frontend op dezelfde domein draaien of configureer CORS correct
   - **404 Not Found bij API verzoeken**: Controleer of de proxy correct is geconfigureerd in Nginx of Vite

6. **Hoofdlettergevoeligheid problemen**:
   - **Import fouten op Linux**: Zorg ervoor dat imports exact overeenkomen met bestandsnamen, inclusief hoofdletters
   - Voorbeeld: Als je een fout krijgt bij `import AppRoutes from "./routes"`, controleer of het bestand misschien `Routes.jsx` heet

7. **Database migratie problemen**:
   - **Ontbrekende kolommen**: Als je een fout krijgt zoals `column X does not exist`, controleer of de migratie correct is uitgevoerd
   - **Oplossing 1**: Voer een volledige herstart van alle containers uit: `docker-compose down && docker-compose up -d`
   - **Oplossing 2**: Voer de migratie handmatig uit: `docker-compose exec backend npm run migrate`
   - **Oplossing 3**: Voeg de ontbrekende kolommen handmatig toe:
     ```bash
     docker-compose exec db psql -U kopfolio -c "
     ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_enabled BOOLEAN DEFAULT TRUE;
     ALTER TABLE settings ADD COLUMN IF NOT EXISTS background_opacity NUMERIC DEFAULT 1;
     ALTER TABLE settings ADD COLUMN IF NOT EXISTS background_color VARCHAR(50) DEFAULT NULL;
     ALTER TABLE settings ADD COLUMN IF NOT EXISTS use_dynamic_background_color BOOLEAN DEFAULT FALSE;
     ALTER TABLE settings ADD COLUMN IF NOT EXISTS favicon TEXT;
     "
     ```
   - **Oplossing 4**: Als alle bovenstaande oplossingen niet werken, overweeg dan om de database volledig opnieuw te initialiseren (let op: dit verwijdert alle gegevens):
     ```bash
     # Maak eerst een backup als je belangrijke gegevens hebt
     docker-compose exec db pg_dump -U kopfolio kopfolio > kopfolio_backup.sql
     
     # Verwijder de database en maak een nieuwe aan
     docker-compose down
     docker volume rm kopfolio_postgres_data
     docker-compose up -d
     ```

8. **Problemen met het laden van assets**:
   - **Ontbrekende patronen of fonts**: Als patronen of fonts niet zichtbaar zijn in de instellingen, controleer de proxy configuratie
   - **Oplossing**: Voeg de ontbrekende proxy routes toe aan `client/vite.config.js`:
     ```javascript
     '/patterns': {
       target: 'http://backend:3000',
       changeOrigin: true
     },
     '/fonts': {
       target: 'http://backend:3000',
       changeOrigin: true
     }
     ```
   - **Controleer of de bestanden bestaan**: Controleer of de patronen en fonts bestaan op de server:
     ```bash
     docker-compose exec backend ls -la /app/public/patterns
     docker-compose exec backend ls -la /app/public/fonts
     ```
   - **Herstart de frontend**: Na het aanpassen van de proxy configuratie, herstart de frontend container:
     ```bash
     docker-compose restart frontend
     ```

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

## Database Migraties

### Automatische Migraties

Kopfolio is nu geconfigureerd om automatisch database migraties uit te voeren bij het opstarten van de server. Dit zorgt ervoor dat de database structuur altijd up-to-date is, zelfs na updates van de applicatie.

Het migratiesysteem werkt als volgt:

1. Bij het opstarten van de server worden alle beschikbare migraties gedetecteerd
2. Elke migratie wordt gecontroleerd of deze al is uitgevoerd
3. Alleen nieuwe migraties worden uitgevoerd
4. Alle uitgevoerde migraties worden geregistreerd in de `migrations` tabel

Dit betekent dat je bij een nieuwe deployment niet handmatig migraties hoeft uit te voeren. De server zal dit automatisch doen.

**Belangrijk**: Na het uitvoeren van migraties kan het nodig zijn om alle containers volledig te herstarten om ervoor te zorgen dat de wijzigingen correct worden toegepast. Dit kan worden gedaan met het volgende commando:

```bash
docker-compose down && docker-compose up -d
```

Een volledige herstart zorgt ervoor dat alle caches worden gewist en dat alle componenten de nieuwe database structuur gebruiken.

### Automatische Database Controle

Naast het migratiesysteem voert Kopfolio ook een automatische controle uit op de database structuur bij elke start van de server. Deze controle:

1. Controleert of alle benodigde kolommen aanwezig zijn in de database
2. Voegt ontbrekende kolommen automatisch toe met standaardwaarden
3. Corrigeert ongeldige waarden in bepaalde kolommen (zoals fonts)

Deze dubbele beveiliging zorgt ervoor dat de database altijd correct is geconfigureerd, zelfs als er problemen zijn met de migraties.

### Volledige Herstart na Migraties

**Belangrijk**: Na het uitvoeren van migraties of na een update van de applicatie is het sterk aanbevolen om alle containers volledig te herstarten. Dit zorgt ervoor dat alle wijzigingen correct worden toegepast en dat alle caches worden gewist.

```bash
docker-compose down && docker-compose up -d
```

Een volledige herstart zorgt ervoor dat:
- Alle containers worden gestopt en opnieuw gestart
- Alle caches worden gewist
- Alle componenten de nieuwe database structuur gebruiken
- Eventuele connectieproblemen worden opgelost

### Handmatige Migraties

Als je toch handmatig migraties wilt uitvoeren, bijvoorbeeld voor ontwikkelingsdoeleinden, kun je het volgende commando gebruiken:

```bash
# In de server directory
npm run migrate

# Of in Docker
docker-compose exec backend npm run migrate
```

### Nieuwe Migraties Toevoegen

Als je zelf migraties wilt toevoegen, volg dan deze stappen:

1. Maak een nieuw SQL bestand aan in de `server/src/migrations` directory
   - Gebruik een duidelijke naamgeving, bijvoorbeeld `026_add_new_feature.sql`

2. Of maak een JavaScript migratie voor complexere wijzigingen:
   - Maak een nieuw JS bestand aan in de `server/src/migrations` directory
   - Exporteer een functie die de migratie uitvoert

Bij de volgende start van de server zullen deze migraties automatisch worden uitgevoerd. 