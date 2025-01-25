import React, { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  useTheme
} from '@mui/material';
import Navigation from './Navigation';
import api from '../utils/api';

console.log('Layout.jsx wordt geladen!');

const Layout = () => {
  console.log('Layout component wordt gerenderd!');
  
  const theme = useTheme();
  const [settings, setSettings] = useState({
    site_title: '',
    site_subtitle: '',
    subtitle_font: 'Roboto',
    subtitle_size: 14,
    subtitle_color: '#FFFFFF',
    logo: null,
    logo_position: 'left',
    logo_margin_top: 0,
    logo_margin_left: 0,
    subtitle_margin_top: 0,
    subtitle_margin_left: 0
  });
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(prev => ({
          ...prev,
          site_title: response.data.site_title || '',
          site_subtitle: response.data.site_subtitle || '',
          subtitle_font: response.data.subtitle_font || 'Roboto',
          subtitle_size: response.data.subtitle_size || 14,
          subtitle_color: response.data.subtitle_color || '#FFFFFF',
          logo: response.data.logo || null,
          logo_position: response.data.logo_position || 'left',
          logo_margin_top: parseInt(response.data.logo_margin_top) || 0,
          logo_margin_left: parseInt(response.data.logo_margin_left) || 0,
          subtitle_margin_top: parseInt(response.data.subtitle_margin_top) || 0,
          subtitle_margin_left: parseInt(response.data.subtitle_margin_left) || 0
        }));
      } catch (error) {
        console.error('Fout bij laden site instellingen:', error);
      }
    };

    loadSettings();

    // Luister naar settings updates
    const handleSettingsUpdate = (event) => {
      const { 
        site_title, 
        site_subtitle, 
        logo_position,
        subtitle_font,
        subtitle_size,
        subtitle_color,
        logo_margin_top,
        logo_margin_left,
        subtitle_margin_top,
        subtitle_margin_left
      } = event.detail;
      
      setSettings(prev => ({
        ...prev,
        site_title: site_title || prev.site_title,
        site_subtitle: site_subtitle || prev.site_subtitle,
        logo_position: logo_position || prev.logo_position,
        subtitle_font: subtitle_font || prev.subtitle_font,
        subtitle_size: subtitle_size || prev.subtitle_size,
        subtitle_color: subtitle_color || prev.subtitle_color,
        logo_margin_top: parseInt(logo_margin_top) || prev.logo_margin_top,
        logo_margin_left: parseInt(logo_margin_left) || prev.logo_margin_left,
        subtitle_margin_top: parseInt(subtitle_margin_top) || prev.subtitle_margin_top,
        subtitle_margin_left: parseInt(subtitle_margin_left) || prev.subtitle_margin_left
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'common.white',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        }}
      >
        <Toolbar sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          height: 64
        }}>
          <Box 
            sx={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: settings.logo_position === 'center' ? 'center' : 'flex-start',
              zIndex: 1200,
              p: 2,
              mt: `${settings.logo_margin_top}px`,
              ml: settings.logo_position === 'left' ? `${settings.logo_margin_left}px` : 'auto',
              mr: settings.logo_position === 'center' ? 'auto' : undefined
            }}
          >
            {settings.logo && (
              <Box
                sx={{
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(30,30,30,0.9)'
                    : 'rgba(60,60,60,0.9)',
                  borderRadius: '0 0 16px 16px',
                  p: 2,
                  pt: 3,
                  mt: -2,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 20px rgba(0,0,0,0.5)' 
                    : '0 4px 20px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box
                  component="img"
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
                  alt="Logo"
                  sx={{
                    height: 120,
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
                {settings.site_subtitle && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: settings.subtitle_color,
                      fontFamily: settings.subtitle_font,
                      fontSize: settings.subtitle_size,
                      textShadow: '0 0 10px rgba(0,0,0,0.5)',
                      mt: `${settings.subtitle_margin_top}px`,
                      ml: `${settings.subtitle_margin_left}px`,
                      textAlign: 'center'
                    }}
                  >
                    {settings.site_subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Navigation />
        </Toolbar>
      </AppBar>

      <Container 
        component="main" 
        sx={{ 
          flex: 1, 
          py: 4,
          px: {
            xs: 2,
            sm: 3,
            md: 4
          },
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
        }}
      >
        <Outlet />
      </Container>

      <Box 
        component="footer" 
        sx={{ 
          py: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'common.white',
          borderTop: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            color={theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary'}
            align="center"
            sx={{ fontWeight: 500 }}
          >
            © {new Date().getFullYear()} {settings.site_title}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 