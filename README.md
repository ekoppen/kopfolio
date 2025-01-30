# Kopfolio

Een moderne fotoportfolio applicatie gebouwd met React en Node.js.

## Features

- Fotogalerij met albums
- Responsive design
- Admin dashboard
- Foto upload met thumbnail generatie
- Pagina beheer met rich text editor

## Technologieën

### Frontend
- React
- Material-UI
- React Router
- Axios
- React Quill

### Backend
- Node.js
- Express
- MySQL
- Multer
- Sharp

## Installatie

1. Clone de repository:
```bash
git clone https://github.com/[username]/kopfolio.git
cd kopfolio
```

2. Installeer dependencies voor zowel frontend als backend:
```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

3. Maak een `.env` bestand aan in de server directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kopfolio
JWT_SECRET=your_jwt_secret
```

4. Maak een `.env` bestand aan in de client directory:
```env
VITE_API_URL=http://localhost:3000/api
```

5. Start de development servers:
```bash
# Start backend (vanuit server directory)
npm run dev

# Start frontend (vanuit client directory)
npm run dev
```

## Docker

Het project kan ook worden uitgevoerd met Docker:

```bash
docker-compose up --build
```

## Project Structuur

```
kopfolio/
├── client/             # Frontend React applicatie
│   ├── src/
│   │   ├── components/ # React componenten
│   │   ├── pages/     # Pagina componenten
│   │   ├── utils/     # Utility functies
│   │   └── styles/    # CSS styles
│   └── public/        # Statische bestanden
├── server/            # Backend Node.js applicatie
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── public/        # Uploads en statische bestanden
└── uploads/           # Foto uploads
    └── sample-images/ # Voorbeeldfoto's
```

## Home Album

De homepage toont foto's uit een speciaal "home album". Dit album wordt automatisch aangemaakt tijdens de installatie. Om dit te configureren:

1. Log in als admin gebruiker
2. Ga naar het admin dashboard
3. Klik op "Albums" in het menu
4. Je ziet een album genaamd "Home Album" met een "Home" label
5. Klik op het foto-icoon bij dit album om foto's toe te voegen
6. Upload nieuwe foto's of selecteer bestaande foto's om ze aan het home album toe te voegen

De geselecteerde foto's zullen nu op de homepage worden getoond in een slideshow.

## Voorbeeldfoto's

In de `uploads/sample-images` map vind je enkele voorbeeldfoto's die je kunt gebruiken om te starten. Om deze te gebruiken:

1. Kopieer de foto's van `uploads/sample-images` naar de `uploads/photos` map
2. De foto's zullen automatisch beschikbaar zijn in het admin dashboard
3. Voeg ze toe aan het home album zoals hierboven beschreven

## Branding

Bij de eerste installatie wordt een standaard configuratie aangemaakt met:
- Een standaard logo in de `uploads/branding` map
- Basis site-instellingen zoals titel en ondertitel
- Standaard lettertypen en kleuren

Om deze aan te passen:
1. Log in als admin gebruiker
2. Ga naar het admin dashboard
3. Pas de volgende instellingen aan:
   - Upload een eigen logo
   - Wijzig de site titel en ondertitel
   - Pas lettertypen en kleuren aan
   - Configureer de positie van het logo
   - Bewerk de voettekst

## Scripts

### Frontend
- `npm run dev`: Start development server
- `npm run build`: Bouw voor productie
- `npm run preview`: Preview productie build

### Backend
- `npm run dev`: Start development server
- `npm start`: Start productie server

## Bijdragen

Pull requests zijn welkom. Voor grote wijzigingen, open eerst een issue om te bespreken wat je wilt veranderen.

## Licentie

[MIT](https://choosealicense.com/licenses/mit/) 