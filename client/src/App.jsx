import React, { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastProvider } from './contexts/ToastContext';
import Routes from './Routes';
import api from './utils/api';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalStyles } from '@mui/material';

const App = () => {
  const [accentColor, setAccentColor] = useState('#2196f3');
  const [font, setFont] = useState('Inter');

  // Laad site instellingen
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        const settings = response.data;
        
        setAccentColor(settings.accent_color || '#2196f3');
        setFont(settings.font || 'Inter');
        
        // Update font in document head
        document.documentElement.style.setProperty('font-family', `${settings.font || 'Inter'}, sans-serif`);
      } catch (error) {
        console.error('Fout bij laden site instellingen:', error);
      }
    };

    loadSettings();

    // Luister naar settings updates
    const handleSettingsUpdate = (event) => {
      const { accent_color, font } = event.detail;
      setAccentColor(accent_color);
      setFont(font);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return (
    <Router>
      <ThemeProvider accentColor={accentColor} font={font}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            'body': {
              backgroundColor: 'transparent !important'
            },
            '.MuiAppBar-root': {
              backgroundColor: 'transparent !important',
              boxShadow: 'none !important',
              borderBottom: 'none !important'
            }
          }}
        />
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 