import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Button, Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Home as HomeIcon, Login as LoginIcon, Dashboard as DashboardIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { ThemeContext } from '../contexts/ThemeContext';

console.log('Navigation.jsx wordt geladen!');

const Navigation = () => {
  console.log('Navigation component wordt gerenderd!');
  
  const isLoggedIn = !!localStorage.getItem('token');
  const location = useLocation();
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);

  console.log('Theme mode:', theme.palette.mode);
  console.log('Theme context:', themeContext);

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<HomeIcon />}
        sx={{ color: 'text.primary' }}
      >
        Home
      </Button>
      {isLoggedIn ? (
        <Button
          component={RouterLink}
          to="/admin"
          startIcon={<DashboardIcon />}
          sx={{ color: 'text.primary' }}
        >
          Admin
        </Button>
      ) : (
        <Button
          component={RouterLink}
          to="/login"
          startIcon={<LoginIcon />}
          sx={{ color: 'text.primary' }}
        >
          Login
        </Button>
      )}
      <IconButton
        onClick={themeContext.toggleDarkMode}
        size="medium"
        sx={{
          color: 'text.primary',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'grey.200',
            borderColor: theme.palette.mode === 'dark' ? 'primary.700' : 'primary.200',
            color: 'primary.main'
          }
        }}
      >
        {themeContext.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Box>
  );
};

export default Navigation; 