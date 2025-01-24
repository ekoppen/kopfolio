import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastProvider } from './contexts/ToastContext';
import Routes from './Routes';
import api from './utils/api';

const App = () => {
  const [theme, setTheme] = useState(createTheme({
    palette: {
      primary: {
        main: '#2196f3'
      }
    },
    typography: {
      fontFamily: 'Inter, sans-serif'
    }
  }));

  // Laad site instellingen
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        const settings = response.data;
        
        // Maak een nieuw theme met de instellingen
        const newTheme = createTheme({
          palette: {
            primary: {
              main: settings.accent_color || '#2196f3'
            }
          },
          typography: {
            fontFamily: `${settings.font || 'Inter'}, sans-serif`
          }
        });
        
        setTheme(newTheme);
        
        // Update font in document head
        document.documentElement.style.setProperty('font-family', `${settings.font || 'Inter'}, sans-serif`);
      } catch (error) {
        console.error('Fout bij laden site instellingen:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App; 