import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { blue } from '@mui/material/colors';
import { useSettings } from './SettingsContext';

console.log('ThemeContext.jsx wordt geladen!');

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {
    console.log('Default toggleDarkMode aangeroepen');
  },
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme moet binnen een ThemeProvider gebruikt worden');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });
  const [themeVersion, setThemeVersion] = useState(0);

  const isDarkMode = mode === 'dark';

  // Luister naar font updates
  useEffect(() => {
    const handleFontUpdate = () => {
      console.log('Font update gedetecteerd, theme wordt vernieuwd');
      setThemeVersion(prev => prev + 1);
    };

    window.addEventListener('fontUpdated', handleFontUpdate);
    return () => window.removeEventListener('fontUpdated', handleFontUpdate);
  }, []);

  // Voeg alleen een class toe aan het body element om dark mode te detecteren in CSS
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Dispatch een event zodat andere componenten weten dat de dark mode is veranderd
    window.dispatchEvent(new CustomEvent('darkModeChanged', { 
      detail: { isDarkMode } 
    }));
  }, [isDarkMode]);

  const commonThemeSettings = useMemo(() => ({
    typography: {
      fontFamily: `${settings?.font || 'Inter'}, "Roboto", "Helvetica", "Arial", sans-serif`,
    },
    shape: {
      borderRadius: 8
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8
          }
        }
      }
    }
  }), [settings?.font]);

  const toggleDarkMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => createTheme({
    ...commonThemeSettings,
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode
            primary: {
              main: settings?.accent_color || '#1976d2',
            },
            secondary: {
              main: '#9c27b0',
            },
            background: {
              default: '#ffffff',
              paper: '#f5f5f5',
            },
          }
        : {
            // Dark mode
            primary: {
              main: settings?.accent_color || '#90caf9',
            },
            secondary: {
              main: '#ce93d8',
            },
            background: {
              default: '#0a0a0a',
              paper: '#121212',
            },
          }),
    },
  }), [mode, settings?.accent_color, commonThemeSettings]);

  const contextValue = useMemo(() => ({
    isDarkMode,
    toggleDarkMode
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;