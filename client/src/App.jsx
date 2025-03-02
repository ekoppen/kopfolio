import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, GlobalStyles } from '@mui/material';
import AppRoutes from './routes';
import ThemeProvider from './contexts/ThemeContext';
import SettingsProvider from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import { useTheme } from '@mui/material/styles';

// Globale stijlen voor de hele applicatie
const GlobalStylesComponent = () => {
  const theme = useTheme();
  
  return (
    <GlobalStyles 
      styles={{
        'html, body, #root': {
          height: '100%',
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
          transition: 'background-color 0.3s ease'
        },
        // Donkere overlay voor de hele applicatie in dark mode
        'body.dark-mode::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: -1,
          pointerEvents: 'none'
        }
      }} 
    />
  );
};

const AppContent = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1
    }}>
      <GlobalStylesComponent />
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </Box>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </SettingsProvider>
  );
};

export default App; 