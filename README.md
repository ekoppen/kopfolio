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
└── server/            # Backend Node.js applicatie
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   └── utils/
    └── public/        # Uploads en statische bestanden
```

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