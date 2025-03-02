import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, Box, IconButton, Stack, Tooltip, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Home as HomeIcon, 
  Login as LoginIcon,
  Logout as LogoutIcon, 
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
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const themeContext = React.useContext(ThemeContext);
  const { settings } = useSettings();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // Haal gebruikersgegevens op uit localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Fout bij parsen gebruikersgegevens:', e);
      }
    }
  }, []);

  // Functie om initialen te genereren
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Bepaal de tekstkleur op basis van de achtergrond in full-left modus
  const getTextColor = () => {
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Verbeterde stijl voor navigatieknoppen met duidelijkere achtergrond
  const buttonStyle = {
    color: getTextColor(),
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
    '&:hover': {
      color: settings?.accent_color || theme.palette.primary.main,
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)'
    },
    position: 'relative',
    zIndex: 100 // Gebruik een redelijke z-index waarde
  };

  const getActiveStyle = (path) => {
    const isActive = location.pathname === path;
    return isActive ? {
      color: settings?.accent_color || theme.palette.primary.main,
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'
      },
      position: 'relative',
      zIndex: 100 // Gebruik een redelijke z-index waarde
    } : buttonStyle;
  };

  return (
    <Stack 
      direction="row" 
      spacing={1}
      alignItems="center"
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
        },
        position: 'relative',
        zIndex: 100 // Gebruik een redelijke z-index waarde
      }}
    >
      <Tooltip title="Home">
        <IconButton
          component={RouterLink}
          to="/"
          sx={getActiveStyle('/')}
        >
          <HomeIcon />
        </IconButton>
      </Tooltip>

      <IconButton
        onClick={onToggleExpand}
        size="medium"
        sx={buttonStyle}
      >
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>

      {isLoggedIn ? (
        <>
          <Tooltip title="Dashboard">
            <IconButton
              component={RouterLink}
              to="/admin"
              sx={getActiveStyle('/admin')}
            >
              <DashboardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Uitloggen">
            <IconButton
              onClick={handleLogout}
              sx={buttonStyle}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          {user && (
            <Tooltip title={user.full_name || user.username}>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  border: '2px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                  position: 'relative',
                  zIndex: 100
                }}
              >
                {getInitials(user.full_name || user.username)}
              </Avatar>
            </Tooltip>
          )}
        </>
      ) : (
        <Tooltip title="Inloggen">
          <IconButton
            component={RouterLink}
            to="/login"
            sx={getActiveStyle('/login')}
          >
            <LoginIcon />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={themeContext.isDarkMode ? 'Lichte modus' : 'Donkere modus'}>
        <IconButton
          onClick={themeContext.toggleDarkMode}
          size="medium"
          sx={buttonStyle}
        >
          {themeContext.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default Navigation; 