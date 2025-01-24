import { createTheme } from '@mui/material/styles';

// Gemeenschappelijke waardes
const commonValues = {
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500
    }
  }
};

// Light theme
const lightTheme = createTheme({
  ...commonValues,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    success: {
      main: '#1b5e20',
      light: '#2e7d32',
      dark: '#1b5e20',
      contrastText: '#ffffff'
    },
    error: {
      main: '#c62828',
      light: '#d32f2f',
      dark: '#b71c1c',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#e65100',
      light: '#ed6c02',
      dark: '#e65100',
      contrastText: '#ffffff'
    },
    info: {
      main: '#01579b',
      light: '#0288d1',
      dark: '#01579b',
      contrastText: '#ffffff'
    }
  }
});

// Dark theme
const darkTheme = createTheme({
  ...commonValues,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5'
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#ffffff'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff'
    }
  }
});

export { lightTheme, darkTheme }; 