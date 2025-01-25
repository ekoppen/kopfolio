import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Button, Box, IconButton, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Home as HomeIcon, Login as LoginIcon, Dashboard as DashboardIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { ThemeContext } from '../contexts/ThemeContext';

const Navigation = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const location = useLocation();
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const isHome = location.pathname === '/';

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          p: 2
        }}
      >
        <Stack direction="row" spacing={1}>
          {!isHome && (
            <Button
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
              sx={{ color: '#fff' }}
            >
              Home
            </Button>
          )}
          {isLoggedIn ? (
            isHome ? (
              <IconButton
                component={RouterLink}
                to="/admin"
                sx={{ 
                  color: '#fff',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                <DashboardIcon />
              </IconButton>
            ) : (
              <Button
                component={RouterLink}
                to="/admin"
                startIcon={<DashboardIcon />}
                sx={{ color: '#fff' }}
              >
                Admin
              </Button>
            )
          ) : (
            isHome ? (
              <IconButton
                component={RouterLink}
                to="/login"
                sx={{ 
                  color: '#fff',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                <LoginIcon />
              </IconButton>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
                sx={{ color: '#fff' }}
              >
                Login
              </Button>
            )
          )}
          <IconButton
            onClick={themeContext.toggleDarkMode}
            size="medium"
            sx={{
              color: '#fff',
              border: '1px solid',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main'
              }
            }}
          >
            {themeContext.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Stack>
      </Box>
    </>
  );
};

export default Navigation; 