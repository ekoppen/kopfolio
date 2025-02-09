import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import SettingsProvider from './contexts/SettingsContext';
import AppRoutes from './routes';

const App = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ThemeProvider>
          <CssBaseline />
          <GlobalStyles
            styles={{
              'body': {
                backgroundColor: 'transparent !important'
              }
            }}
          />
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </ThemeProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App; 