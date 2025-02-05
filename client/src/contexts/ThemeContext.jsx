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
      primary: {
        main: settings?.accent_color || blue[500],
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff'
      }
    }
  }), [mode, settings?.accent_color, commonThemeSettings, themeVersion]);

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