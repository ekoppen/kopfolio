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
import { useSettings } from '../contexts/SettingsContext';

const Navigation = ({ isExpanded, onToggleExpand }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  const location = useLocation();
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const { settings } = useSettings();
  const isHome = location.pathname === '/';

  // Bepaal de tekstkleur op basis van de achtergrond in full-left modus
  const getTextColor = () => {
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };

  const buttonStyle = {
    color: getTextColor(),
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
    '&:hover': {
      color: settings?.accent_color || theme.palette.primary.main,
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.1)'
    }
  };

  const getActiveStyle = (path) => {
    const isActive = location.pathname === path;
    return isActive ? {
      color: settings?.accent_color || theme.palette.primary.main,
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.1)',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)'
      }
    } : buttonStyle;
  };

  return (
    <Stack 
      direction="row" 
      spacing={1}
      sx={{
        '& .MuiIconButton-root': {
          transition: 'all 0.2s ease-in-out',
          minWidth: 'auto',
          width: 36,
          height: 36,
          padding: '8px',
          borderRadius: '8px',
          ...buttonStyle,
          '& .MuiSvgIcon-root': {
            fontSize: 20
          }
        }
      }}
    >
      <IconButton
        onClick={onToggleExpand}
        size="medium"
        sx={buttonStyle}
      >
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>

      {isLoggedIn ? (
        <IconButton
          component={RouterLink}
          to="/admin"
          sx={getActiveStyle('/admin')}
        >
          <DashboardIcon />
        </IconButton>
      ) : (
        <IconButton
          component={RouterLink}
          to="/login"
          sx={getActiveStyle('/login')}
        >
          <LoginIcon />
        </IconButton>
      )}

      <IconButton
        onClick={themeContext.toggleDarkMode}
        size="medium"
        sx={buttonStyle}
      >
        {themeContext.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Stack>
  );
};

export default Navigation; 