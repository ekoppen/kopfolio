# Kopfolio

Een moderne fotoportfolio applicatie gebouwd met React en Node.js. Kopfolio stelt fotografen in staat om hun werk op een elegante en professionele manier te presenteren, met ondersteuning voor albums, pagina's met rijke content en een gebruiksvriendelijk admin dashboard.

![Kopfolio Screenshot](demo-images/screenshot.png)

## Inhoudsopgave

- [Features](#features)
- [Technologieën](#technologieën)
- [Installatie](#installatie)
  - [Vereisten](#vereisten)
  - [Standaard Installatie](#standaard-installatie)
  - [Docker Installatie](#docker-installatie)
  - [Configuratie](#configuratie)
- [Gebruikershandleiding](#gebruikershandleiding)
  - [Admin Dashboard](#admin-dashboard)
  - [Foto's Beheren](#fotos-beheren)
  - [Albums Beheren](#albums-beheren)
  - [Pagina's Beheren](#paginas-beheren)
  - [Instellingen Configureren](#instellingen-configureren)
  - [Gebruikersbeheer](#gebruikersbeheer)
- [Ontwikkelaarshandleiding](#ontwikkelaarshandleiding)
  - [Project Structuur](#project-structuur)
  - [Scripts](#scripts)
  - [API Documentatie](#api-documentatie)
- [Bijdragen](#bijdragen)
- [Licentie](#licentie)

## Features

- **Fotogalerij met albums**: Organiseer foto's in albums en presenteer ze in verschillende layouts
- **Fullscreen slideshows**: Toon foto's in een indrukwekkende fullscreen modus
- **Responsive design**: Werkt perfect op desktop, tablet en mobiel
- **Admin dashboard**: Beheer alle content via een intuïtieve interface
- **Foto upload**: Upload foto's met automatische thumbnail generatie
- **Pagina beheer**: Maak en bewerk pagina's met een rich text editor
- **Gebruikersbeheer**: Beheer admin gebruikers met verschillende rechten
- **Thema aanpassing**: Pas kleuren, lettertypen en layout aan
- **Contactformulier**: Ingebouwd contactformulier met e-mail notificaties
- **SEO-vriendelijk**: Optimaliseer je site voor zoekmachines

## Technologieën

### Frontend
- **React**: JavaScript bibliotheek voor gebruikersinterfaces
- **Material-UI**: React UI framework met Material Design
- **React Router**: Voor navigatie en routing
- **Axios**: HTTP client voor API requests
- **React Quill**: Rich text editor voor pagina content
- **Swiper**: Voor responsive slideshows
- **Vite**: Moderne build tool en development server

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework voor Node.js
- **PostgreSQL**: Relationele database
- **Sequelize**: ORM voor database interacties
- **Multer & Sharp**: Voor bestandsuploads en beeldverwerking
- **JWT**: Voor authenticatie
- **Nodemailer**: Voor e-mail functionaliteit

## Installatie

### Vereisten

- Node.js (v16 of hoger)
- npm of yarn
- PostgreSQL (v13 of hoger) of SQLite voor ontwikkeling
- Git

### Standaard Installatie

1. Clone de repository:
```bash
git clone https://github.com/[username]/kopfolio.git
cd kopfolio
```

2. Installeer dependencies voor zowel frontend als backend:
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

3. Maak een `.env` bestand aan in de server directory:
```env
# Database configuratie
DB_HOST=localhost
DB_USER=jouw_db_gebruiker
DB_PASSWORD=jouw_db_wachtwoord
DB_NAME=kopfolio
DB_DIALECT=postgres  # of 'sqlite' voor ontwikkeling

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

4. Maak een `.env` bestand aan in de client directory:
```env
VITE_API_URL=http://localhost:3000/api
```

5. Initialiseer de database:
```bash
# Vanuit de server directory
npm run db:init
```

6. Start de development servers:
```bash
# Start backend (vanuit server directory)
npm run dev

# Start frontend (vanuit client directory, in een nieuwe terminal)
npm run dev
```

7. Open je browser en ga naar `http://localhost:5173` (of de poort die Vite aangeeft)

### Docker Installatie

Voor een snelle start met Docker:

1. Clone de repository:
```bash
git clone https://github.com/[username]/kopfolio.git
cd kopfolio
```

2. Start de containers:
```bash
docker-compose up --build
```

3. Open je browser en ga naar `http://localhost:5173`

### Configuratie

Na de eerste installatie kun je inloggen met de standaard admin account:

- **Gebruikersnaam**: admin@example.com
- **Wachtwoord**: admin123

**Belangrijk**: Wijzig dit wachtwoord onmiddellijk na je eerste login!

## Gebruikershandleiding

### Admin Dashboard

Het admin dashboard is toegankelijk via `/admin`. Hier kun je alle aspecten van je portfolio beheren:

1. **Login**: Gebruik je admin e-mailadres en wachtwoord om in te loggen
2. **Dashboard Overzicht**: Bekijk statistieken en recente activiteiten
3. **Navigatie**: Gebruik het zijmenu om naar verschillende secties te navigeren

### Foto's Beheren

1. **Foto's uploaden**:
   - Ga naar "Foto's" in het admin menu
   - Klik op de "Upload" knop
   - Sleep foto's naar het uploadgebied of klik om bestanden te selecteren
   - Voeg optioneel metadata toe zoals titel, beschrijving en tags

2. **Foto's organiseren**:
   - Bekijk alle foto's in het fotobeheer
   - Gebruik filters en zoekfunctie om specifieke foto's te vinden
   - Sleep foto's om de volgorde aan te passen
   - Selecteer meerdere foto's voor bulkacties

3. **Foto details bewerken**:
   - Klik op een foto om details te bekijken
   - Bewerk titel, beschrijving, tags en andere metadata
   - Pas beeldbewerking toe zoals bijsnijden of filters

### Albums Beheren

1. **Albums aanmaken**:
   - Ga naar "Albums" in het admin menu
   - Klik op "Nieuw Album"
   - Voer een titel en beschrijving in
   - Kies een coverafbeelding
   - Stel privacy-instellingen in (publiek/privé)

2. **Foto's toevoegen aan albums**:
   - Open een album
   - Klik op "Foto's toevoegen"
   - Selecteer foto's uit je bibliotheek of upload nieuwe
   - Pas de volgorde aan door te slepen

3. **Home Album configureren**:
   - Het "Home Album" is speciaal en wordt gebruikt voor de homepage slideshow
   - Voeg foto's toe aan dit album om ze op de homepage te tonen
   - Pas de volgorde aan om de slideshow volgorde te bepalen

### Pagina's Beheren

1. **Pagina's aanmaken**:
   - Ga naar "Pagina's" in het admin menu
   - Klik op "Nieuwe Pagina"
   - Kies een paginatype (normaal of fullscreen slideshow)
   - Voer een titel en beschrijving in
   - Stel de URL slug in

2. **Content bewerken**:
   - Gebruik de blok-editor om content toe te voegen
   - Beschikbare blokken: tekst, afbeelding, slideshow, video, etc.
   - Sleep blokken om de volgorde aan te passen
   - Bewerk individuele blokken door erop te klikken

3. **Pagina-instellingen**:
   - Stel SEO-instellingen in (titel, beschrijving, keywords)
   - Configureer privacy-instellingen
   - Stel publicatiedatum in
   - Koppel de pagina aan het navigatiemenu

### Instellingen Configureren

1. **Site-instellingen**:
   - Ga naar "Instellingen" in het admin menu
   - Configureer site titel, beschrijving en keywords
   - Upload een logo en favicon
   - Pas footer tekst aan

2. **Thema aanpassen**:
   - Kies kleuren voor primaire en secundaire elementen
   - Selecteer lettertypen voor titels en tekst
   - Upload aangepaste lettertypen indien gewenst
   - Kies achtergrondpatronen of -kleuren

3. **Menu configureren**:
   - Voeg pagina's toe aan het navigatiemenu
   - Maak submenu's en dropdown items
   - Pas de volgorde aan
   - Stel links in naar externe websites

4. **Email instellingen**:
   - Configureer SMTP-instellingen voor e-mailnotificaties
   - Pas e-mailsjablonen aan
   - Test e-mailfunctionaliteit

### Gebruikersbeheer

1. **Gebruikers toevoegen**:
   - Ga naar "Gebruikers" in het admin menu
   - Klik op "Nieuwe Gebruiker"
   - Voer e-mailadres, naam en wachtwoord in
   - Wijs rechten toe

2. **Rechten beheren**:
   - Configureer wie toegang heeft tot welke delen van het admin dashboard
   - Stel in wie foto's kan uploaden, pagina's kan bewerken, etc.
   - Maak aangepaste rechtenprofielen

## Ontwikkelaarshandleiding

### Project Structuur

```
kopfolio/
├── client/                 # Frontend React applicatie
│   ├── public/             # Statische bestanden
│   └── src/
│       ├── components/     # React componenten
│       ├── contexts/       # React context providers
│       ├── pages/          # Pagina componenten
│       ├── services/       # API service functies
│       ├── styles/         # CSS en styling
│       └── utils/          # Utility functies
│
├── server/                 # Backend Node.js applicatie
│   ├── public/             # Publiek toegankelijke bestanden
│   └── src/
│       ├── controllers/    # Route controllers
│       ├── db/             # Database configuratie
│       ├── middleware/     # Express middleware
│       ├── models/         # Sequelize modellen
│       ├── routes/         # API routes
│       └── services/       # Business logic services
│
├── content/                # Content bestanden
│   ├── uploads/            # Geüploade bestanden
│   ├── patterns/           # Achtergrondpatronen
│   └── fonts/              # Aangepaste lettertypen
│
└── docker-compose.yml      # Docker configuratie
```

### Scripts

#### Frontend (client directory)
- `npm run dev`: Start development server
- `npm run build`: Bouw voor productie
- `npm run preview`: Preview productie build

#### Backend (server directory)
- `npm run dev`: Start development server met hot-reloading
- `npm start`: Start productie server
- `npm run db:init`: Initialiseer database met tabellen en standaardgegevens
- `npm run db:seed`: Vul database met voorbeeldgegevens

### API Documentatie

De backend API is beschikbaar op `/api` en bevat de volgende endpoints:

- **Authenticatie**
  - `POST /api/auth/login`: Inloggen
  - `POST /api/auth/logout`: Uitloggen
  - `GET /api/auth/me`: Huidige gebruiker ophalen

- **Foto's**
  - `GET /api/photos`: Alle foto's ophalen
  - `POST /api/photos`: Nieuwe foto uploaden
  - `GET /api/photos/:id`: Specifieke foto ophalen
  - `PUT /api/photos/:id`: Foto bijwerken
  - `DELETE /api/photos/:id`: Foto verwijderen

- **Albums**
  - `GET /api/albums`: Alle albums ophalen
  - `POST /api/albums`: Nieuw album aanmaken
  - `GET /api/albums/:id`: Specifiek album ophalen
  - `PUT /api/albums/:id`: Album bijwerken
  - `DELETE /api/albums/:id`: Album verwijderen
  - `POST /api/albums/:id/photos`: Foto's toevoegen aan album

- **Pagina's**
  - `GET /api/pages`: Alle pagina's ophalen
  - `POST /api/pages`: Nieuwe pagina aanmaken
  - `GET /api/pages/:id`: Specifieke pagina ophalen
  - `PUT /api/pages/:id`: Pagina bijwerken
  - `DELETE /api/pages/:id`: Pagina verwijderen

- **Instellingen**
  - `GET /api/settings`: Instellingen ophalen
  - `PUT /api/settings`: Instellingen bijwerken

- **Gebruikers**
  - `GET /api/users`: Alle gebruikers ophalen
  - `POST /api/users`: Nieuwe gebruiker aanmaken
  - `GET /api/users/:id`: Specifieke gebruiker ophalen
  - `PUT /api/users/:id`: Gebruiker bijwerken
  - `DELETE /api/users/:id`: Gebruiker verwijderen

## Bijdragen

Bijdragen aan Kopfolio zijn welkom! Volg deze stappen:

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je wijzigingen (`git commit -m 'Add some amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

Voor grote wijzigingen, open eerst een issue om te bespreken wat je wilt veranderen.

## Licentie

[MIT](https://choosealicense.com/licenses/mit/)

## Ontwikkeling

### Vereisten
- Node.js 20 of hoger
- Docker en Docker Compose
- Git

### Installatie

1. Clone de repository:
```bash
git clone https://github.com/jouwusername/kopfolio.git
cd kopfolio
```

2. Kopieer de voorbeeld environment bestanden:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

3. Start de ontwikkelomgeving:
```bash
docker-compose up -d
```

De applicatie is nu beschikbaar op:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

### Environment Variables

#### Frontend (client/.env)
- `VITE_API_URL`: De URL van de backend API
  - Ontwikkeling: `http://localhost:3000/api`
  - Productie: `https://api.jouwdomein.nl/api`

#### Backend (server/.env)
- `PORT`: De poort waar de backend server op draait (standaard: 3000)
- `DB_HOST`: Database host (standaard: db)
- `DB_PORT`: Database poort (standaard: 5432)
- `DB_NAME`: Database naam (standaard: kopfolio)
- `DB_USER`: Database gebruiker (standaard: kopfolio)
- `DB_PASSWORD`: Database wachtwoord
- `JWT_SECRET`: Geheime sleutel voor JWT tokens
- `NODE_ENV`: Omgevingsvariabele (development/production)
- `CORS_ALLOWED_ORIGINS`: Lijst van toegestane domeinen voor CORS (gescheiden door komma's)
  - Ontwikkeling: `http://localhost:5173,http://localhost:3000`
  - Productie: `https://www.jouwdomein.nl,https://jouwdomein.nl`

### Deployment

1. Maak een `.env` bestand aan in de `client` directory met de juiste productie configuratie:
```bash
VITE_API_URL=https://api.jouwdomein.nl/api
```

2. Maak een `.env` bestand aan in de `server` directory met de juiste productie configuratie:
```bash
NODE_ENV=production
DB_PASSWORD=sterk_productie_wachtwoord
JWT_SECRET=sterke_productie_secret
CORS_ALLOWED_ORIGINS=https://www.jouwdomein.nl,https://jouwdomein.nl
```

3. Build de frontend:
```bash
cd client
npm run build
```

4. De backend kan worden gestart met:
```bash
cd server
npm start
```

Of gebruik Docker Compose voor een volledige container deployment:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Features

- Responsive design
- Foto galerij met albums
- Admin dashboard
- Pagina beheer
- Instellingen voor thema en layout
- Gebruikersbeheer met rollen
- JWT authenticatie
- Database migraties
- Docker containerisatie

## Technologieën

- Frontend: React, Vite, Material-UI
- Backend: Node.js, Express
- Database: PostgreSQL
- Authenticatie: JWT
- Containerisatie: Docker
- Build tools: Vite

## Licentie

MIT 