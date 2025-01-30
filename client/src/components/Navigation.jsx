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
            color: '#fff',
            bgcolor: 'rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.4)'
            }
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
  );
};

export default Navigation; 