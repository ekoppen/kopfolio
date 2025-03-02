import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings moet binnen een SettingsProvider gebruikt worden');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const theme = useTheme();
  const prevSettingsRef = useRef({});

  // Laad eerst de fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await api.get('/settings/fonts');
        console.log('Loaded fonts from server:', response.data);

        // Filter custom fonts
        const customFonts = response.data.filter(font => font.type !== 'system');
        console.log('Custom fonts to load:', customFonts);

        const styleSheet = document.createElement('style');
        
        const fontFaces = customFonts.map(font => {
          // Bepaal het juiste format voor verschillende bestandstypen
          let format;
          switch (font.type) {
            case 'woff2':
              format = 'woff2';
              break;
            case 'woff':
              format = 'woff';
              break;
            case 'ttf':
              format = 'truetype';
              break;
            case 'otf':
              format = 'opentype';
              break;
            default:
              format = font.type;
          }

          // Bouw de font URL op en encode deze correct
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          const fontUrl = `${baseUrl}/fonts/${encodeURIComponent(font.file)}`;
          console.log('Loading font from URL:', fontUrl);

          const fontFace = `
            @font-face {
              font-family: '${font.value}';
              src: url('${fontUrl}') format('${format}');
              font-weight: normal;
              font-style: normal;
              font-display: block;
            }
          `;
          console.log('Generated @font-face:', fontFace);
          return { fontFace, format, fontUrl };
        });

        console.log('All @font-face rules:', fontFaces);
        styleSheet.textContent = fontFaces.map(f => f.fontFace).join('\n');
        document.head.appendChild(styleSheet);

        // Wacht tot alle fonts zijn geladen
        await Promise.all(customFonts.map(async (font, index) => {
          const { format, fontUrl } = fontFaces[index];
          console.log('Preloading font:', fontUrl);

          const link = document.createElement('link');
          link.href = fontUrl;
          link.rel = 'preload';
          link.as = 'font';
          link.type = `font/${font.type}`;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);

          try {
            // Laad de font direct met een gecodeerde URL
            const loader = new FontFace(font.value, `url(${fontUrl}) format('${format}')`);
            const loadedFont = await loader.load();
            document.fonts.add(loadedFont);
            console.log('Successfully loaded font:', font.value);
          } catch (err) {
            console.error('Error loading specific font:', font.value, err);
            // Ga door met laden van andere fonts als er één faalt
          }
        }));

        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Ga toch door, zelfs als fonts niet laden
      }
    };

    loadFonts();
  }, []);

  // Laad de instellingen pas nadat de fonts zijn geladen
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        const savedPosition = localStorage.getItem('appBarPosition');
        console.log('Raw settings from server:', response.data);
        
        // Parse en valideer alle numerieke waarden
        const parsedSettings = {
          ...response.data,
          logo_position: savedPosition || response.data.logo_position || 'left',
          subtitle_size: Number(response.data.subtitle_size) || 14,
          logo_margin_top: Number(response.data.logo_margin_top) || 0,
          logo_margin_left: Number(response.data.logo_margin_left) || 0,
          subtitle_margin_top: Number(response.data.subtitle_margin_top) || 0,
          subtitle_margin_left: Number(response.data.subtitle_margin_left) || 0,
          pattern_opacity: Number(response.data.pattern_opacity) || 0.1,
          pattern_scale: Number(response.data.pattern_scale) || 1,
          logo_size: Number(response.data.logo_size) || 200,
          menu_font_size: Number(response.data.menu_font_size) || 16,
          content_font_size: Number(response.data.content_font_size) || 16,
          background_color: response.data.background_color || null,
          background_opacity: Number(response.data.background_opacity) || 1
        };

        console.log('Parsed settings before setting state:', parsedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Gebruik default settings als er iets misgaat
        setSettings({
          site_title: 'Mijn Portfolio',
          site_subtitle: 'Fotografie Portfolio',
          subtitle_font: 'system-ui',
          subtitle_size: 14,
          subtitle_color: '#666666',
          accent_color: '#000000',
          font: 'system-ui',
          logo: null,
          logo_position: localStorage.getItem('appBarPosition') || 'left',
          logo_margin_top: 20,
          logo_margin_left: 20,
          subtitle_margin_top: 10,
          subtitle_margin_left: 0,
          footer_text: '© 2024 Mijn Portfolio',
          sidebar_pattern: null,
          pattern_opacity: 0.1,
          pattern_scale: 1,
          pattern_color: '#000000',
          logo_size: 200,
          menu_font_size: 16,
          content_font_size: 16,
          background_color: null,
          background_opacity: 1
        });
      } finally {
        setLoading(false);
      }
    };

    if (fontsLoaded) {
      loadSettings();
    }
  }, [fontsLoaded]);

  // Luister naar settings updates van andere componenten
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      const newSettings = event.detail;
      setSettings(prev => ({
        ...prev,
        ...newSettings,
        subtitle_size: parseInt(newSettings.subtitle_size) || prev.subtitle_size,
        logo_margin_top: parseInt(newSettings.logo_margin_top) || prev.logo_margin_top,
        logo_margin_left: parseInt(newSettings.logo_margin_left) || prev.logo_margin_left,
        subtitle_margin_top: parseInt(newSettings.subtitle_margin_top) || prev.subtitle_margin_top,
        subtitle_margin_left: parseInt(newSettings.subtitle_margin_left) || prev.subtitle_margin_left,
        pattern_opacity: parseFloat(newSettings.pattern_opacity) || prev.pattern_opacity,
        pattern_scale: parseFloat(newSettings.pattern_scale) || prev.pattern_scale,
        logo_size: parseInt(newSettings.logo_size) || prev.logo_size,
        menu_font_size: parseInt(newSettings.menu_font_size) || prev.menu_font_size,
        content_font_size: parseInt(newSettings.content_font_size) || prev.content_font_size,
        background_color: newSettings.background_color || prev.background_color,
        background_opacity: parseFloat(newSettings.background_opacity) !== undefined ? parseFloat(newSettings.background_opacity) : prev.background_opacity
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  // Update body background color when settings change
  useEffect(() => {
    console.log('Achtergrondkleur effect uitgevoerd met:', {
      background_color: settings?.background_color,
      background_opacity: settings?.background_opacity
    });
    
    if (settings?.background_color) {
      // Functie om hex kleur naar rgba te converteren
      const hexToRgba = (hex, opacity) => {
        if (!hex) return 'transparent';
        
        // Verwijder # indien aanwezig
        hex = hex.replace('#', '');
        
        // Converteer 3-cijferige hex naar 6-cijferige
        if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Converteer hex naar rgb
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Retourneer rgba
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };

      // Pas de achtergrondkleur toe met de juiste transparantie
      const opacity = settings?.background_opacity !== undefined ? parseFloat(settings.background_opacity) : 1;
      const bgColor = hexToRgba(settings.background_color, opacity);
      
      console.log('Toepassen achtergrondkleur:', bgColor);
      
      // Pas de kleur direct toe op meerdere elementen voor betere zichtbaarheid
      document.body.style.backgroundColor = bgColor;
      document.documentElement.style.backgroundColor = bgColor;
      document.getElementById('root').style.backgroundColor = bgColor;
      
      // Voeg een CSS variabele toe die we kunnen gebruiken in de hele applicatie
      document.documentElement.style.setProperty('--background-color', bgColor);
      
      // Voeg een inline style toe aan het body element voor debugging
      document.body.setAttribute('style', `background-color: ${bgColor} !important`);
    } else {
      const defaultColor = theme.palette.mode === 'dark' 
        ? 'rgba(35, 35, 45, 0.98)'
        : '#ffffff';
      
      console.log('Geen achtergrondkleur ingesteld, gebruik standaard:', defaultColor);
      
      document.body.style.backgroundColor = defaultColor;
      document.documentElement.style.backgroundColor = defaultColor;
      document.getElementById('root').style.backgroundColor = defaultColor;
      document.documentElement.style.setProperty('--background-color', defaultColor);
      document.body.setAttribute('style', `background-color: ${defaultColor} !important`);
    }
  }, [settings?.background_color, settings?.background_opacity, theme.palette.mode]);

  // Luister naar dark mode veranderingen
  useEffect(() => {
    const handleDarkModeChange = (event) => {
      console.log('Dark mode verandering gedetecteerd:', event.detail.isDarkMode);
      
      // Haal de opacity waarde uit het event of gebruik de waarde uit de instellingen
      const opacity = event.detail.opacity !== undefined 
        ? event.detail.opacity 
        : (settings?.background_opacity !== undefined ? parseFloat(settings.background_opacity) : 0.95);
      
      // Als er geen expliciete achtergrondkleur is ingesteld, pas dan de standaard dark/light kleur toe
      if (!settings?.background_color) {
        const defaultColor = event.detail.isDarkMode 
          ? `rgba(18, 18, 18, ${opacity})`
          : '#ffffff';
        
        console.log('Geen achtergrondkleur ingesteld, gebruik standaard dark/light kleur:', defaultColor);
        
        document.body.style.backgroundColor = defaultColor;
        document.documentElement.style.backgroundColor = defaultColor;
        document.getElementById('root').style.backgroundColor = defaultColor;
        document.documentElement.style.setProperty('--background-color', defaultColor);
        document.body.setAttribute('style', `background-color: ${defaultColor} !important`);
      }
    };

    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, [settings?.background_color, settings?.background_opacity]);

  // Render een loading indicator als we nog bezig zijn met laden
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>;
  }

  const updateSettings = async (newSettings) => {
    try {
      console.log('updateSettings aangeroepen met:', newSettings);
      
      // Parse numerieke waarden voordat we ze naar de server sturen
      const settingsToSave = {
        ...newSettings,
        subtitle_size: Number(newSettings.subtitle_size),
        logo_margin_top: Number(newSettings.logo_margin_top),
        logo_margin_left: Number(newSettings.logo_margin_left),
        subtitle_margin_top: Number(newSettings.subtitle_margin_top),
        subtitle_margin_left: Number(newSettings.subtitle_margin_left),
        pattern_opacity: Number(newSettings.pattern_opacity),
        pattern_scale: Number(newSettings.pattern_scale),
        logo_size: Number(newSettings.logo_size),
        menu_font_size: Number(newSettings.menu_font_size),
        content_font_size: Number(newSettings.content_font_size),
        background_color: newSettings.background_color,
        background_opacity: parseFloat(newSettings.background_opacity) !== undefined ? parseFloat(newSettings.background_opacity) : settings.background_opacity,
        use_dynamic_background_color: newSettings.use_dynamic_background_color === true
      };

      console.log('Settings to save:', settingsToSave);
      
      // Sla de wijzigingen op in de database
      const response = await api.put('/settings', settingsToSave);
      console.log('Response from server after save:', response.data);
      
      // Update de lokale state met de geparseerde waarden
      setSettings(prev => {
        console.log('Previous settings:', prev);
        const newState = {
          ...prev,
          ...settingsToSave
        };
        console.log('New settings state:', newState);
        return newState;
      });

      // Update localStorage als logo_position verandert
      if (newSettings.logo_position) {
        localStorage.setItem('appBarPosition', newSettings.logo_position);
      }

      // Verstuur een fontUpdated event ALLEEN als de instellingen zijn opgeslagen
      if (newSettings.font !== settings.font || newSettings.subtitle_font !== settings.subtitle_font) {
        console.log('Font wijziging opgeslagen, verstuur fontUpdated event');
        window.dispatchEvent(new CustomEvent('fontUpdated'));
      }

      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: settingsToSave
      }));

      return true;
    } catch (error) {
      console.error('Fout bij opslaan instellingen:', error);
      return false;
    }
  };

  // Functie voor tijdelijke lokale updates (zonder opslaan)
  const updateSettingsLocally = (newSettings) => {
    // Controleer of de nieuwe instellingen verschillen van de huidige
    let hasChanges = false;
    
    // Vergelijk elke nieuwe instelling met de huidige waarde
    Object.keys(newSettings).forEach(key => {
      if (settings[key] !== newSettings[key]) {
        hasChanges = true;
      }
    });
    
    // Alleen updaten als er daadwerkelijk iets is veranderd
    if (hasChanges) {
      console.log('updateSettingsLocally: Wijzigingen gedetecteerd, instellingen worden bijgewerkt');
      setSettings(prev => {
        const newState = {
          ...prev,
          ...newSettings
        };
        return newState;
      });
    } else {
      console.log('updateSettingsLocally: Geen wijzigingen gedetecteerd, instellingen blijven ongewijzigd');
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings,
      updateSettingsLocally,
      setSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 