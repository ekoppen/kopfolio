import React, { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Component om de favicon dynamisch te beheren op basis van de instellingen
 */
const DynamicFavicon = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // Update de favicon wanneer de instellingen veranderen
    if (settings && settings.favicon) {
      const faviconPath = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.favicon}`;
      
      // Zoek bestaande favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      
      // Verwijder bestaande favicons
      existingFavicons.forEach(favicon => favicon.remove());
      
      // Maak een nieuwe favicon link element voor standaard favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = `${faviconPath}?v=${Date.now()}`; // Voorkom caching door timestamp toe te voegen
      
      // Bepaal het type op basis van de bestandsextensie
      const fileExtension = settings.favicon.split('.').pop().toLowerCase();
      if (fileExtension === 'svg') {
        link.type = 'image/svg+xml';
      } else if (fileExtension === 'png') {
        link.type = 'image/png';
      } else if (fileExtension === 'ico') {
        link.type = 'image/x-icon';
      } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
        link.type = 'image/jpeg';
      }
      
      // Voeg de nieuwe favicon toe aan de head
      document.head.appendChild(link);
      
      // Voeg ook een Apple touch icon toe voor iOS apparaten
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = `${faviconPath}?v=${Date.now()}`;
      document.head.appendChild(appleLink);
      
      // Voeg een shortcut icon toe voor oudere browsers
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = `${faviconPath}?v=${Date.now()}`;
      document.head.appendChild(shortcutLink);
      
      // Forceer een refresh van de favicon in de browser tab
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        const clone = favicon.cloneNode(true);
        favicon.remove();
        document.head.appendChild(clone);
      }
    }
  }, [settings]);

  // Deze component rendert niets zichtbaars
  return null;
};

export default DynamicFavicon; 