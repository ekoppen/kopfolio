import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '../theme';

console.log('ThemeContext.jsx wordt geladen!');

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {
    console.log('Default toggleDarkMode aangeroepen');
  },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, accentColor, font }) => {
  console.log('ThemeProvider wordt gerenderd!');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    const initialMode = savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('Initial dark mode:', initialMode);
    return initialMode;
  });

  useEffect(() => {
    console.log('Dark mode gewijzigd naar:', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    console.log('toggleDarkMode aangeroepen, huidige isDarkMode:', isDarkMode);
    setIsDarkMode(prev => !prev);
  };

  const theme = useMemo(() => {
    console.log('Theme wordt opnieuw berekend, isDarkMode:', isDarkMode);
    const baseTheme = isDarkMode ? darkTheme : lightTheme;
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: isDarkMode ? 'dark' : 'light',
        primary: {
          main: accentColor,
          light: isDarkMode ? '#e3f2fd' : '#42a5f5',
          dark: isDarkMode ? '#42a5f5' : '#1565c0',
        }
      },
      typography: {
        ...baseTheme.typography,
        fontFamily: `"${font}", ${baseTheme.typography.fontFamily}`
      }
    });
  }, [isDarkMode, accentColor, font]);

  const contextValue = useMemo(() => {
    console.log('Context value wordt opnieuw berekend');
    return {
      isDarkMode,
      toggleDarkMode
    };
  }, [isDarkMode]);

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