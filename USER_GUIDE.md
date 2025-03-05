# Kopfolio Gebruikershandleiding

Deze handleiding bevat gedetailleerde instructies voor het gebruik van Kopfolio, een moderne fotoportfolio applicatie.

## Inhoudsopgave

- [Inleiding](#inleiding)
- [Aan de slag](#aan-de-slag)
  - [Inloggen](#inloggen)
  - [Dashboard Overzicht](#dashboard-overzicht)
  - [Navigatie](#navigatie)
- [Foto's Beheren](#fotos-beheren)
  - [Foto's Uploaden](#fotos-uploaden)
  - [Foto's Organiseren](#fotos-organiseren)
  - [Foto Details Bewerken](#foto-details-bewerken)
- [Albums Beheren](#albums-beheren)
  - [Albums Aanmaken](#albums-aanmaken)
  - [Foto's Toevoegen aan Albums](#fotos-toevoegen-aan-albums)
  - [Home Album Configureren](#home-album-configureren)
- [Pagina's Beheren](#paginas-beheren)
  - [Pagina's Aanmaken](#paginas-aanmaken)
  - [Content Bewerken](#content-bewerken)
  - [Pagina-instellingen](#pagina-instellingen)
- [Instellingen Configureren](#instellingen-configureren)
  - [Site-instellingen](#site-instellingen)
  - [Thema Aanpassen](#thema-aanpassen)
  - [Menu Configureren](#menu-configureren)
  - [Email Instellingen](#email-instellingen)
- [Gebruikersbeheer](#gebruikersbeheer)
  - [Gebruikers Toevoegen](#gebruikers-toevoegen)
  - [Rechten Beheren](#rechten-beheren)
- [Tips en Trucs](#tips-en-trucs)

## Inleiding

Kopfolio is een moderne fotoportfolio applicatie waarmee je je fotografiewerk professioneel kunt presenteren. De applicatie biedt een gebruiksvriendelijk admin dashboard voor het beheren van foto's, albums, pagina's en site-instellingen.

## Aan de slag

### Inloggen

1. Open je browser en ga naar `http://jouwdomein.com/admin` (of `http://localhost:5173/admin` in een ontwikkelomgeving)
2. Voer je e-mailadres en wachtwoord in
3. Klik op "Inloggen"

![Admin Login](demo-images/admin-login.png)

### Dashboard Overzicht

Na het inloggen zie je het dashboard overzicht met:

- Recente activiteiten
- Statistieken over je portfolio (aantal foto's, albums, pagina's)
- Snelkoppelingen naar veelgebruikte functies

![Dashboard](demo-images/dashboard.png)

### Navigatie

Het admin dashboard heeft een zijmenu met de volgende secties:

- **Dashboard**: Overzicht en statistieken
- **Foto's**: Fotobibliotheek beheren
- **Albums**: Albums aanmaken en beheren
- **Pagina's**: Pagina's aanmaken en bewerken
- **Instellingen**: Site-instellingen configureren
- **Gebruikers**: Gebruikersbeheer

Je kunt het zijmenu inklappen door op het hamburgermenu-icoon te klikken.

## Foto's Beheren

### Foto's Uploaden

1. Ga naar "Foto's" in het admin menu
2. Klik op de "Upload" knop
3. Sleep foto's naar het uploadgebied of klik om bestanden te selecteren
4. Wacht tot de upload voltooid is
5. Voeg optioneel metadata toe zoals titel, beschrijving en tags

![Foto Upload](demo-images/photo-upload.png)

**Tips voor foto's uploaden**:
- Ondersteunde formaten: JPG, PNG, WebP
- Maximale bestandsgrootte: 10MB per foto
- Voor optimale prestaties, upload foto's met een resolutie van maximaal 2500px op de langste zijde

### Foto's Organiseren

In het fotobeheer kun je:

1. **Foto's zoeken**:
   - Gebruik de zoekbalk om te zoeken op titel, beschrijving of tags
   - Filter op datum, album of andere metadata

2. **Foto's sorteren**:
   - Klik op de kolomkoppen om te sorteren op datum, titel, etc.
   - Gebruik drag-and-drop om handmatig te sorteren

3. **Bulkacties uitvoeren**:
   - Selecteer meerdere foto's door de checkboxes aan te vinken
   - Gebruik de bulkacties menu voor acties zoals verwijderen, tags toevoegen, of aan album toevoegen

![Foto Beheer](demo-images/photo-management.png)

### Foto Details Bewerken

1. Klik op een foto in het fotobeheer om de details te bekijken
2. Bewerk de volgende informatie:
   - **Titel**: De naam van de foto
   - **Beschrijving**: Een beschrijving van de foto
   - **Tags**: Trefwoorden voor categorisering
   - **Alt Tekst**: Alternatieve tekst voor toegankelijkheid
   - **EXIF Data**: Bekijk en bewerk camera metadata
3. Gebruik de beeldbewerking tools voor:
   - Bijsnijden
   - Draaien
   - Filters toepassen
4. Klik op "Opslaan" om de wijzigingen toe te passen

![Foto Details](demo-images/photo-details.png)

## Albums Beheren

### Albums Aanmaken

1. Ga naar "Albums" in het admin menu
2. Klik op "Nieuw Album"
3. Vul de volgende informatie in:
   - **Titel**: De naam van het album
   - **Beschrijving**: Een beschrijving van het album
   - **Slug**: De URL voor het album (wordt automatisch gegenereerd)
   - **Coverafbeelding**: De hoofdafbeelding voor het album
   - **Zichtbaarheid**: Publiek of privé
4. Klik op "Aanmaken" om het album op te slaan

![Nieuw Album](demo-images/new-album.png)

### Foto's Toevoegen aan Albums

1. Open een album door erop te klikken in het albumoverzicht
2. Klik op "Foto's toevoegen"
3. Selecteer foto's uit je bibliotheek:
   - Gebruik de zoekfunctie om specifieke foto's te vinden
   - Filter op datum of tags
   - Selecteer meerdere foto's met de checkboxes
4. Klik op "Toevoegen aan album" om de geselecteerde foto's toe te voegen
5. Pas de volgorde aan door foto's te slepen

![Foto's aan Album Toevoegen](demo-images/add-photos-to-album.png)

### Home Album Configureren

Het "Home Album" is een speciaal album dat wordt gebruikt voor de slideshow op de homepage:

1. Ga naar "Albums" in het admin menu
2. Zoek het album met het label "Home"
3. Klik op dit album om het te openen
4. Voeg foto's toe zoals beschreven in de vorige sectie
5. Pas de volgorde aan om de slideshow volgorde te bepalen
6. Configureer slideshow-instellingen:
   - **Overgangseffect**: Fade, slide, etc.
   - **Snelheid**: Hoe snel de slideshow verandert
   - **Autoplay**: Automatisch afspelen aan/uit
   - **Navigatie**: Pijlen en/of dots tonen

![Home Album](demo-images/home-album.png)

## Pagina's Beheren

### Pagina's Aanmaken

1. Ga naar "Pagina's" in het admin menu
2. Klik op "Nieuwe Pagina"
3. Kies een paginatype:
   - **Normale pagina**: Voor tekstuele content met afbeeldingen
   - **Fullscreen slideshow**: Voor een pagina met een fullscreen fotogalerij
4. Vul de volgende informatie in:
   - **Titel**: De naam van de pagina
   - **Beschrijving**: Een korte beschrijving (wordt gebruikt voor SEO)
   - **Slug**: De URL voor de pagina
5. Klik op "Aanmaken" om de pagina op te slaan

![Nieuwe Pagina](demo-images/new-page.png)

### Content Bewerken

De pagina-editor gebruikt een blok-gebaseerd systeem:

1. Klik op "+" om een nieuw blok toe te voegen
2. Kies uit de volgende bloktypes:
   - **Tekst**: Rich text met opmaak
   - **Kop**: Titel of subtitel
   - **Afbeelding**: Enkele afbeelding
   - **Galerij**: Raster van afbeeldingen
   - **Slideshow**: Carousel van afbeeldingen
   - **Video**: Ingesloten video
   - **Citaat**: Uitgelichte quote
   - **Scheidingslijn**: Horizontale lijn
   - **Contactformulier**: Formulier voor bezoekers
3. Bewerk de inhoud van elk blok door erop te klikken
4. Sleep blokken om de volgorde aan te passen
5. Klik op "Opslaan" om de wijzigingen toe te passen

![Pagina Editor](demo-images/page-editor.png)

### Pagina-instellingen

Elke pagina heeft de volgende instellingen:

1. **SEO-instellingen**:
   - **Meta titel**: Titel die in zoekmachines wordt getoond
   - **Meta beschrijving**: Beschrijving voor zoekmachines
   - **Keywords**: Trefwoorden voor zoekmachines
   - **OG Image**: Afbeelding voor social media shares

2. **Zichtbaarheid**:
   - **Publicatiestatus**: Concept, gepubliceerd, of gearchiveerd
   - **Publicatiedatum**: Wanneer de pagina zichtbaar wordt
   - **Wachtwoord bescherming**: Optionele wachtwoordbeveiliging

3. **Menu-instellingen**:
   - **Tonen in menu**: Of de pagina in het navigatiemenu verschijnt
   - **Menu volgorde**: Positie in het menu
   - **Ouder pagina**: Voor submenu's

![Pagina Instellingen](demo-images/page-settings.png)

## Instellingen Configureren

### Site-instellingen

1. Ga naar "Instellingen" in het admin menu
2. Configureer de volgende opties:
   - **Site titel**: De naam van je website
   - **Tagline**: Een korte slogan of beschrijving
   - **Logo**: Upload je logo (aanbevolen formaat: 200x50px)
   - **Favicon**: Het pictogram dat in browsertabs wordt getoond
   - **Footer tekst**: Tekst die onderaan elke pagina verschijnt

![Site Instellingen](demo-images/site-settings.png)

### Thema Aanpassen

1. Ga naar het tabblad "Thema" in de instellingen
2. Pas de volgende elementen aan:
   - **Kleuren**: Primaire kleur, secundaire kleur, achtergrondkleur, tekstkleur
   - **Lettertypen**: Kies lettertypen voor titels en tekst
   - **Aangepaste lettertypen**: Upload je eigen lettertypen
   - **Achtergrond**: Kies een kleur, patroon of afbeelding
   - **Layout**: Pas marges, padding en andere layout-opties aan

![Thema Instellingen](demo-images/theme-settings.png)

### Menu Configureren

1. Ga naar het tabblad "Menu" in de instellingen
2. Voeg menu-items toe:
   - **Pagina's**: Kies uit bestaande pagina's
   - **Albums**: Link naar specifieke albums
   - **Externe links**: Voeg links naar andere websites toe
3. Organiseer menu-items:
   - Sleep items om de volgorde aan te passen
   - Maak submenu's door items onder elkaar te slepen
   - Stel de zichtbaarheid in (desktop, mobiel, of beide)
4. Configureer menu-stijl:
   - **Positie**: Links, rechts of bovenaan
   - **Stijl**: Licht, donker of transparant
   - **Animatie**: Overgangseffecten

![Menu Configuratie](demo-images/menu-configuration.png)

### Email Instellingen

1. Ga naar het tabblad "Email" in de instellingen
2. Configureer SMTP-instellingen:
   - **SMTP Server**: Bijv. smtp.gmail.com
   - **SMTP Poort**: Meestal 587 of 465
   - **Gebruikersnaam**: Je e-mailadres
   - **Wachtwoord**: Je e-mailwachtwoord
   - **Afzender**: Het e-mailadres dat als afzender wordt gebruikt
3. Pas e-mailsjablonen aan:
   - **Contactformulier**: E-mail die wordt verzonden bij contactformulierinzendingen
   - **Welkomstmail**: E-mail voor nieuwe gebruikers
4. Test de e-mailconfiguratie met de "Test e-mail verzenden" knop

![Email Instellingen](demo-images/email-settings.png)

## Gebruikersbeheer

### Gebruikers Toevoegen

1. Ga naar "Gebruikers" in het admin menu
2. Klik op "Nieuwe Gebruiker"
3. Vul de volgende informatie in:
   - **Naam**: Volledige naam van de gebruiker
   - **E-mail**: E-mailadres (wordt gebruikt voor inloggen)
   - **Wachtwoord**: Tijdelijk wachtwoord
   - **Rol**: Admin, Editor, of Viewer
4. Klik op "Aanmaken" om de gebruiker toe te voegen

![Nieuwe Gebruiker](demo-images/new-user.png)

### Rechten Beheren

1. Ga naar "Gebruikers" in het admin menu
2. Klik op een gebruiker om de details te bekijken
3. Ga naar het tabblad "Rechten"
4. Configureer de volgende rechten:
   - **Foto's**: Uploaden, bewerken, verwijderen
   - **Albums**: Aanmaken, bewerken, verwijderen
   - **Pagina's**: Aanmaken, bewerken, verwijderen
   - **Instellingen**: Bekijken, bewerken
   - **Gebruikers**: Beheren
5. Klik op "Opslaan" om de rechten toe te passen

![Gebruikersrechten](demo-images/user-permissions.png)

## Tips en Trucs

### Optimalisatie voor Zoekmachines (SEO)

1. **Gebruik beschrijvende titels**: Zorg voor duidelijke, beschrijvende titels voor je pagina's en foto's
2. **Voeg alt-tekst toe aan afbeeldingen**: Dit helpt zoekmachines te begrijpen wat er op je foto's staat
3. **Gebruik meta beschrijvingen**: Voeg een duidelijke beschrijving toe aan elke pagina
4. **Optimaliseer laadtijd**: Houd je afbeeldingen geoptimaliseerd voor snelle laadtijden

### Prestaties Verbeteren

1. **Optimaliseer afbeeldingen**: Upload foto's met een redelijke resolutie (max 2500px op de langste zijde)
2. **Gebruik caching**: Schakel browser caching in via de instellingen
3. **Beperk aantal foto's per pagina**: Toon niet meer dan 20-30 foto's per pagina voor optimale laadtijden

### Mobiele Weergave

1. **Test op verschillende apparaten**: Controleer hoe je portfolio eruitziet op verschillende schermformaten
2. **Pas menu aan voor mobiel**: Configureer een mobiel-vriendelijk menu
3. **Optimaliseer touch-interacties**: Zorg ervoor dat knoppen en links groot genoeg zijn voor touch-interactie

### Backup en Beveiliging

1. **Maak regelmatig backups**: Gebruik de backup-functie in het dashboard
2. **Wijzig wachtwoorden regelmatig**: Verander je admin wachtwoord elke 3-6 maanden
3. **Houd de software up-to-date**: Installeer updates zodra deze beschikbaar zijn 