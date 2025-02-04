import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { Box, CircularProgress } from '@mui/material';

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

          // Bouw de font URL op
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          const fontUrl = `${baseUrl}/fonts/${font.file}`;
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

          // Laad de font direct
          const loader = new FontFace(font.value, `url(${fontUrl}) format('${format}')`);
          await loader.load();
          document.fonts.add(loader);
          console.log('Successfully loaded font:', font.value);
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
        console.log('Loaded settings:', response.data, 'Saved position:', savedPosition);
        
        // Parse en valideer alle numerieke waarden
        const parsedSettings = {
          ...response.data,
          logo_position: savedPosition || response.data.logo_position || 'left',
          subtitle_size: parseInt(response.data.subtitle_size) || 14,
          logo_margin_top: parseInt(response.data.logo_margin_top) || 0,
          logo_margin_left: parseInt(response.data.logo_margin_left) || 0,
          subtitle_margin_top: parseInt(response.data.subtitle_margin_top) || 0,
          subtitle_margin_left: parseInt(response.data.subtitle_margin_left) || 0,
          pattern_opacity: parseFloat(response.data.pattern_opacity) || 0.1,
          pattern_scale: parseFloat(response.data.pattern_scale) || 1,
          logo_size: parseInt(response.data.logo_size) || 200
        };

        console.log('Parsed settings:', parsedSettings);
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
          logo_size: 200
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
        logo_size: parseInt(newSettings.logo_size) || prev.logo_size
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  // Render een loading indicator als we nog bezig zijn met laden
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>;
  }

  const updateSettings = async (newSettings) => {
    try {
      await api.put('/settings', newSettings);
      
      // Parse numerieke waarden voordat we ze opslaan
      const parsedSettings = {
        ...newSettings,
        subtitle_size: parseInt(newSettings.subtitle_size) || settings.subtitle_size,
        logo_margin_top: parseInt(newSettings.logo_margin_top) || settings.logo_margin_top,
        logo_margin_left: parseInt(newSettings.logo_margin_left) || settings.logo_margin_left,
        subtitle_margin_top: parseInt(newSettings.subtitle_margin_top) || settings.subtitle_margin_top,
        subtitle_margin_left: parseInt(newSettings.subtitle_margin_left) || settings.subtitle_margin_left,
        pattern_opacity: parseFloat(newSettings.pattern_opacity) || settings.pattern_opacity,
        pattern_scale: parseFloat(newSettings.pattern_scale) || settings.pattern_scale,
        logo_size: parseInt(newSettings.logo_size) || settings.logo_size
      };

      setSettings(prev => ({
        ...prev,
        ...parsedSettings
      }));

      // Update localStorage als logo_position verandert
      if (newSettings.logo_position) {
        localStorage.setItem('appBarPosition', newSettings.logo_position);
      }

      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: parsedSettings
      }));
      
      return true;
    } catch (error) {
      console.error('Fout bij updaten instellingen:', error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings,
      setSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider; 