import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Button, Box, IconButton, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Home as HomeIcon, 
  Login as LoginIcon, 
  Dashboard as DashboardIcon, 
  DarkMode as DarkModeIcon, 
  LightMode as LightModeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { ThemeContext } from '../contexts/ThemeContext';

const Navigation = ({ isExpanded, onToggleExpand }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  const location = useLocation();
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const isHome = location.pathname === '/';

  return (
    <Stack direction="row" spacing={1}>
      {/* Toggle Button */}
      {onToggleExpand && (
        <IconButton
          onClick={onToggleExpand}
          size="medium"
          sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : '#000',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
            },
            borderRadius: '50%',
            width: 40,
            height: 40,
            padding: 1
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      )}

      {!isHome && (
        <Button
          component={RouterLink}
          to="/"
          startIcon={<HomeIcon />}
          sx={{ 
            color: theme.palette.mode === 'dark' ? '#fff' : '#000',
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
          }}
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
              color: theme.palette.mode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                color: 'primary.main',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
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
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                color: 'primary.main',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }
            }}
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
              color: theme.palette.mode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                color: 'primary.main',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
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
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#fff' : '#000',
              '&:hover': {
                color: 'primary.main',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }
            }}
          >
            Login
          </Button>
        )
      )}
      <IconButton
        onClick={themeContext.toggleDarkMode}
        size="medium"
        sx={{
          color: theme.palette.mode === 'dark' ? '#fff' : '#000',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          '&:hover': {
            borderColor: 'primary.main',
            color: 'primary.main',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }
        }}
      >
        {themeContext.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Stack>
  );
};

export default Navigation; 