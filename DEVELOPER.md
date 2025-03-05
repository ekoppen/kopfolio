# Kopfolio Ontwikkelaarshandleiding

Deze handleiding bevat gedetailleerde informatie voor ontwikkelaars die willen bijdragen aan of werken met Kopfolio.

## Inhoudsopgave

- [Architectuur Overzicht](#architectuur-overzicht)
- [Technologie Stack](#technologie-stack)
- [Project Structuur](#project-structuur)
- [Ontwikkelomgeving Opzetten](#ontwikkelomgeving-opzetten)
- [Codebase Navigatie](#codebase-navigatie)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Database Schema](#database-schema)
- [API Documentatie](#api-documentatie)
- [Testen](#testen)
- [Deployment](#deployment)
- [Bijdragen](#bijdragen)
- [Veelgestelde Vragen](#veelgestelde-vragen)

## Architectuur Overzicht

Kopfolio is gebouwd volgens een client-server architectuur:

- **Frontend**: Een React single-page application (SPA) die communiceert met de backend via RESTful API calls
- **Backend**: Een Node.js/Express server die API endpoints blootstelt en database operaties uitvoert
- **Database**: PostgreSQL database voor het opslaan van alle applicatiegegevens
- **Bestandsopslag**: Lokaal bestandssysteem voor het opslaan van geüploade afbeeldingen en andere assets

De applicatie volgt een modulaire structuur met duidelijke scheiding van verantwoordelijkheden:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│   (React)   │◀────│  (Node.js)  │◀────│ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │ File System │
                    │  (Uploads)  │
                    └─────────────┘
```

## Technologie Stack

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
- **Sequelize**: ORM voor database interacties
- **PostgreSQL**: Relationele database
- **Multer & Sharp**: Voor bestandsuploads en beeldverwerking
- **JWT**: Voor authenticatie
- **Nodemailer**: Voor e-mail functionaliteit

## Project Structuur

```
kopfolio/
├── client/                 # Frontend React applicatie
│   ├── public/             # Statische bestanden
│   └── src/
│       ├── components/     # React componenten
│       │   ├── admin/      # Admin dashboard componenten
│       │   ├── common/     # Herbruikbare UI componenten
│       │   ├── layout/     # Layout componenten
│       │   └── viewer/     # Publieke weergave componenten
│       ├── contexts/       # React context providers
│       ├── pages/          # Pagina componenten
│       │   ├── admin/      # Admin pagina's
│       │   └── public/     # Publieke pagina's
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
│       ├── services/       # Business logic services
│       ├── scripts/        # Utility scripts
│       └── migrations/     # Database migraties
│
├── content/                # Content bestanden
│   ├── uploads/            # Geüploade bestanden
│   ├── patterns/           # Achtergrondpatronen
│   └── fonts/              # Aangepaste lettertypen
│
└── docker-compose.yml      # Docker configuratie
```

## Ontwikkelomgeving Opzetten

### Vereisten
- Node.js (v16 of hoger)
- npm of yarn
- PostgreSQL (v13 of hoger) of SQLite voor ontwikkeling
- Git

### Stappen

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
   
   Voor ontwikkeling kun je SQLite gebruiken:
   ```bash
   # In server/.env
   DB_DIALECT=sqlite
   DB_STORAGE=./database.sqlite
   ```

   Of PostgreSQL:
   ```bash
   # In server/.env
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=kopfolio
   DB_PASSWORD=jouw_wachtwoord
   DB_NAME=kopfolio
   ```

4. **Initialiseer de database**:
   ```bash
   cd ../server
   npm run db:init
   ```

5. **Start de development servers**:
   ```bash
   # Start backend (vanuit server directory)
   npm run dev

   # Start frontend (vanuit client directory, in een nieuwe terminal)
   cd ../client
   npm run dev
   ```

6. **Open de applicatie**:
   
   Open je browser en ga naar `http://localhost:5173`

## Codebase Navigatie

### Frontend

De frontend code is georganiseerd volgens een feature-based structuur:

#### Belangrijke Bestanden en Mappen

- **`src/main.jsx`**: Entry point van de applicatie
- **`src/App.jsx`**: Hoofdcomponent die de applicatie initialiseert
- **`src/Routes.jsx`**: Definieert alle routes in de applicatie
- **`src/contexts/`**: React context providers voor state management
  - **`AuthContext.jsx`**: Authenticatie state en functies
  - **`SettingsContext.jsx`**: Applicatie-instellingen
  - **`ToastContext.jsx`**: Notificatie systeem
- **`src/components/`**: Alle React componenten
  - **`admin/`**: Admin dashboard componenten
  - **`common/`**: Herbruikbare UI componenten
  - **`layout/`**: Layout componenten (header, footer, etc.)
  - **`viewer/`**: Componenten voor de publieke weergave
- **`src/pages/`**: Pagina componenten
  - **`admin/`**: Admin pagina's
  - **`public/`**: Publieke pagina's
- **`src/services/`**: API service functies
  - **`api.js`**: Axios configuratie en basis API functies
  - **`auth.js`**: Authenticatie services
  - **`photos.js`**: Foto-gerelateerde API calls
- **`src/utils/`**: Utility functies
  - **`formatters.js`**: Functies voor het formatteren van data
  - **`validators.js`**: Validatiefuncties
  - **`helpers.js`**: Algemene helper functies

#### Component Structuur

Componenten volgen meestal deze structuur:

```jsx
import React, { useState, useEffect } from 'react';
import { useComponentSpecificHooks } from 'react';
import { ComponentSpecificContext } from '../../contexts';
import { apiService } from '../../services';
import { SubComponent } from './SubComponent';

const ComponentName = ({ prop1, prop2 }) => {
  // State en hooks
  const [state, setState] = useState(initialState);
  const { contextValue } = useContext(ComponentSpecificContext);
  
  // Side effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Event handling logic
  };
  
  // Helper functions
  const helperFunction = () => {
    // Helper logic
  };
  
  // Render
  return (
    <div className="component-name">
      {/* JSX structure */}
      <SubComponent prop={state} onEvent={handleEvent} />
    </div>
  );
};

export default ComponentName;
```

### Backend

De backend code volgt een MVC-achtige structuur:

#### Belangrijke Bestanden en Mappen

- **`src/index.js`**: Entry point van de server
- **`src/app.js`**: Express applicatie setup
- **`src/routes/`**: API route definities
  - **`auth.js`**: Authenticatie routes
  - **`photos.js`**: Foto-gerelateerde routes
  - **`albums.js`**: Album-gerelateerde routes
  - **`pages.js`**: Pagina-gerelateerde routes
- **`src/controllers/`**: Route controllers
  - **`authController.js`**: Authenticatie logica
  - **`photoController.js`**: Foto-gerelateerde logica
  - **`albumController.js`**: Album-gerelateerde logica
  - **`pageController.js`**: Pagina-gerelateerde logica
- **`src/models/`**: Sequelize modellen
  - **`User.js`**: Gebruikersmodel
  - **`Photo.js`**: Fotomodel
  - **`Album.js`**: Albummodel
  - **`Page.js`**: Paginamodel
- **`src/middleware/`**: Express middleware
  - **`auth.js`**: Authenticatie middleware
  - **`upload.js`**: Bestandsupload middleware
  - **`validation.js`**: Request validatie middleware
- **`src/services/`**: Business logic services
  - **`photoService.js`**: Foto-gerelateerde services
  - **`emailService.js`**: E-mail services

#### Route Structuur

Routes volgen meestal deze structuur:

```javascript
import express from 'express';
import { controller } from '../controllers';
import { authMiddleware, validationMiddleware } from '../middleware';

const router = express.Router();

// GET /api/resource
router.get('/', authMiddleware.verifyToken, controller.getAll);

// GET /api/resource/:id
router.get('/:id', controller.getById);

// POST /api/resource
router.post('/',
  authMiddleware.verifyToken,
  validationMiddleware.validateResource,
  controller.create
);

// PUT /api/resource/:id
router.put('/:id',
  authMiddleware.verifyToken,
  validationMiddleware.validateResource,
  controller.update
);

// DELETE /api/resource/:id
router.delete('/:id',
  authMiddleware.verifyToken,
  controller.delete
);

export default router;
```

## Database Schema

Kopfolio gebruikt een relationele database met de volgende hoofdtabellen:

### Users
- `id`: Primary key
- `name`: Gebruikersnaam
- `email`: E-mailadres (uniek)
- `password`: Gehashed wachtwoord
- `role`: Gebruikersrol (admin, editor, viewer)
- `created_at`: Aanmaakdatum
- `updated_at`: Laatste update

### Photos
- `id`: Primary key
- `title`: Titel van de foto
- `description`: Beschrijving
- `filename`: Bestandsnaam
- `filepath`: Pad naar het bestand
- `filesize`: Bestandsgrootte
- `width`: Breedte in pixels
- `height`: Hoogte in pixels
- `mimetype`: MIME type
- `exif`: EXIF metadata (JSON)
- `tags`: Tags (array)
- `user_id`: Foreign key naar Users
- `created_at`: Aanmaakdatum
- `updated_at`: Laatste update

### Albums
- `id`: Primary key
- `title`: Titel van het album
- `description`: Beschrijving
- `slug`: URL-vriendelijke naam
- `cover_photo_id`: Foreign key naar Photos
- `is_home`: Boolean die aangeeft of dit het home album is
- `is_public`: Zichtbaarheid
- `user_id`: Foreign key naar Users
- `created_at`: Aanmaakdatum
- `updated_at`: Laatste update

### AlbumPhotos (Junction Table)
- `album_id`: Foreign key naar Albums
- `photo_id`: Foreign key naar Photos
- `order`: Volgorde in het album
- `created_at`: Aanmaakdatum

### Pages
- `id`: Primary key
- `title`: Titel van de pagina
- `description`: Beschrijving
- `slug`: URL-vriendelijke naam
- `content`: Pagina-inhoud (JSON)
- `is_fullscreen_slideshow`: Boolean die aangeeft of dit een fullscreen slideshow pagina is
- `meta_title`: SEO titel
- `meta_description`: SEO beschrijving
- `is_published`: Publicatiestatus
- `user_id`: Foreign key naar Users
- `created_at`: Aanmaakdatum
- `updated_at`: Laatste update

### Settings
- `id`: Primary key
- `key`: Instelling naam
- `value`: Instelling waarde (JSON)
- `created_at`: Aanmaakdatum
- `updated_at`: Laatste update

## API Documentatie

De backend API is beschikbaar op `/api` en bevat de volgende endpoints:

### Authenticatie

#### `POST /api/auth/login`
Inloggen met e-mail en wachtwoord.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

#### `POST /api/auth/logout`
Uitloggen (invalidate token).

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

#### `GET /api/auth/me`
Huidige gebruiker ophalen.

**Headers**:
```
Authorization: Bearer jwt_token_here
```

**Response**:
```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "admin"
}
```

### Foto's

#### `GET /api/photos`
Alle foto's ophalen.

**Query Parameters**:
- `page`: Paginanummer (default: 1)
- `limit`: Aantal items per pagina (default: 20)
- `sort`: Sorteerveld (default: 'created_at')
- `order`: Sorteervolgorde ('asc' of 'desc', default: 'desc')
- `search`: Zoekterm
- `tags`: Filteren op tags (comma-gescheiden)

**Response**:
```json
{
  "photos": [
    {
      "id": 1,
      "title": "Photo Title",
      "description": "Photo Description",
      "filename": "photo.jpg",
      "filepath": "/uploads/photos/photo.jpg",
      "thumbnail": "/uploads/photos/thumbnails/photo.jpg",
      "width": 1920,
      "height": 1080,
      "tags": ["nature", "landscape"],
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

#### `POST /api/photos`
Nieuwe foto uploaden.

**Headers**:
```
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

**Form Data**:
- `photo`: Bestand
- `title`: Titel (optioneel)
- `description`: Beschrijving (optioneel)
- `tags`: Tags (comma-gescheiden, optioneel)

**Response**:
```json
{
  "id": 1,
  "title": "Photo Title",
  "description": "Photo Description",
  "filename": "photo.jpg",
  "filepath": "/uploads/photos/photo.jpg",
  "thumbnail": "/uploads/photos/thumbnails/photo.jpg",
  "width": 1920,
  "height": 1080,
  "tags": ["nature", "landscape"],
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Albums

#### `GET /api/albums`
Alle albums ophalen.

**Response**:
```json
[
  {
    "id": 1,
    "title": "Album Title",
    "description": "Album Description",
    "slug": "album-title",
    "cover_photo": {
      "id": 1,
      "filepath": "/uploads/photos/photo.jpg",
      "thumbnail": "/uploads/photos/thumbnails/photo.jpg"
    },
    "is_home": false,
    "is_public": true,
    "photo_count": 10,
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

#### `POST /api/albums`
Nieuw album aanmaken.

**Headers**:
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Album Title",
  "description": "Album Description",
  "slug": "album-title",
  "cover_photo_id": 1,
  "is_public": true
}
```

**Response**:
```json
{
  "id": 1,
  "title": "Album Title",
  "description": "Album Description",
  "slug": "album-title",
  "cover_photo": {
    "id": 1,
    "filepath": "/uploads/photos/photo.jpg",
    "thumbnail": "/uploads/photos/thumbnails/photo.jpg"
  },
  "is_home": false,
  "is_public": true,
  "photo_count": 0,
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Testen

### Frontend Testen

Voor het testen van de frontend componenten:

```bash
cd client
npm test
```

### Backend Testen

Voor het testen van de backend API:

```bash
cd server
npm test
```

## Deployment

### Productie Build

1. **Bouw de frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Configureer de server**:
   ```bash
   cd ../server
   # Pas .env aan voor productie
   ```

3. **Start de server**:
   ```bash
   npm start
   ```

### Docker Deployment

Voor deployment met Docker:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Bijdragen

Bijdragen aan Kopfolio zijn welkom! Volg deze stappen:

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je wijzigingen (`git commit -m 'Add some amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

### Code Stijl

- Volg de ESLint configuratie in het project
- Schrijf betekenisvolle commit messages
- Documenteer nieuwe functies
- Voeg tests toe voor nieuwe functionaliteit

## Veelgestelde Vragen

### Hoe voeg ik een nieuwe pagina toe aan het admin dashboard?

1. Maak een nieuw component in `client/src/pages/admin/`
2. Voeg de route toe in `client/src/Routes.jsx`
3. Voeg een menu-item toe in `client/src/components/admin/Sidebar.jsx`

### Hoe voeg ik een nieuw API endpoint toe?

1. Maak een controller functie in de juiste controller file
2. Voeg de route toe in de juiste route file
3. Implementeer de business logic in een service indien nodig
4. Update de API documentatie

### Hoe voeg ik een nieuw databasemodel toe?

1. Maak een nieuw model in `server/src/models/`
2. Maak een migratie in `server/src/migrations/`
3. Voeg relaties toe aan bestaande modellen indien nodig
4. Update het database schema in deze documentatie