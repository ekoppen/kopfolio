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
    if (settings.logo_position === 'full-left' && settings.pattern_color) {
      const hex = settings.pattern_color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };

  const buttonStyle = {
    color: getTextColor(),
    '&:hover': {
      color: settings?.accent_color || theme.palette.primary.main,
      bgcolor: settings.logo_position === 'full-left'
        ? `rgba(${settings?.accent_color ? parseInt(settings.accent_color.slice(1, 3), 16) : 0}, ${settings?.accent_color ? parseInt(settings.accent_color.slice(3, 5), 16) : 0}, ${settings?.accent_color ? parseInt(settings.accent_color.slice(5, 7), 16) : 0}, 0.1)`
        : 'rgba(0, 0, 0, 0.1)'
    }
  };

  return (
    <Stack 
      direction="row" 
      spacing={1}
      sx={{
        '& .MuiIconButton-root': {
          transition: 'all 0.2s ease-in-out',
          minWidth: 'auto',
          padding: '8px',
          ...buttonStyle
        },
        '& .MuiButton-root': {
          fontSize: `${settings?.menu_font_size || 16}px`,
          transition: 'all 0.2s ease-in-out',
          minWidth: 'auto',
          padding: '8px 12px'
        }
      }}
    >
      {/* Toggle Button */}
      {onToggleExpand && (
        <IconButton
          onClick={onToggleExpand}
          size="medium"
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            padding: 1,
            ...buttonStyle
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      )}

      {!isHome && (
        <IconButton
          component={RouterLink}
          to="/"
          sx={buttonStyle}
        >
          <HomeIcon />
        </IconButton>
      )}

      {isLoggedIn ? (
        <IconButton
          component={RouterLink}
          to="/admin"
          sx={buttonStyle}
        >
          <DashboardIcon />
        </IconButton>
      ) : (
        <IconButton
          component={RouterLink}
          to="/login"
          sx={buttonStyle}
        >
          <LoginIcon />
        </IconButton>
      )}

      <IconButton
        onClick={themeContext.toggleDarkMode}
        size="medium"
        sx={{
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          ...buttonStyle
        }}
      >
        {themeContext.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Stack>
  );
};

export default Navigation; 