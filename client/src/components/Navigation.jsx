import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import { Home as HomeIcon, Login as LoginIcon, Dashboard as DashboardIcon } from '@mui/icons-material';

const Navigation = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<HomeIcon />}
        sx={{ 
          color: isActive('/') ? 'primary.main' : 'grey.700',
          bgcolor: isActive('/') ? 'primary.50' : 'transparent',
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'primary.50'
          }
        }}
      >
        Home
      </Button>
      {isLoggedIn ? (
        <Button
          component={RouterLink}
          to="/admin"
          startIcon={<DashboardIcon />}
          sx={{ 
            color: location.pathname.startsWith('/admin') ? 'primary.main' : 'grey.700',
            bgcolor: location.pathname.startsWith('/admin') ? 'primary.50' : 'transparent',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'primary.50'
            }
          }}
        >
          Admin
        </Button>
      ) : (
        <Button
          component={RouterLink}
          to="/login"
          startIcon={<LoginIcon />}
          sx={{ 
            color: isActive('/login') ? 'primary.main' : 'grey.700',
            bgcolor: isActive('/login') ? 'primary.50' : 'transparent',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'primary.50'
            }
          }}
        >
          Login
        </Button>
      )}
    </Box>
  );
};

export default Navigation; 