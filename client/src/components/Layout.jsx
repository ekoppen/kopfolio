import React, { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  useTheme,
  Button,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
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
    accent_color: '#000000',
    font: 'Roboto',
    logo: null,
    logo_position: 'left',
    logo_margin_top: 0,
    logo_margin_left: 0,
    subtitle_margin_top: 0,
    subtitle_margin_left: 0,
    footer_text: ''
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem('appBarExpanded');
    return savedState !== null ? JSON.parse(savedState) : false;
  });
  const [barPosition, setBarPosition] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition || 'top'; // 'top' of 'full-left'
  });
  const [menuPages, setMenuPages] = useState([]);
  
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
          accent_color: response.data.accent_color || '#000000',
          font: response.data.font || 'Roboto',
          logo: response.data.logo || null,
          logo_position: response.data.logo_position || 'left',
          logo_margin_top: parseInt(response.data.logo_margin_top) || 0,
          logo_margin_left: parseInt(response.data.logo_margin_left) || 0,
          subtitle_margin_top: parseInt(response.data.subtitle_margin_top) || 0,
          subtitle_margin_left: parseInt(response.data.subtitle_margin_left) || 0,
          footer_text: response.data.footer_text || ''
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
        subtitle_font,
        subtitle_size,
        subtitle_color,
        accent_color,
        font,
        logo_position,
        logo_margin_top,
        logo_margin_left,
        subtitle_margin_top,
        subtitle_margin_left,
        footer_text
      } = event.detail;
      
      setSettings(prev => ({
        ...prev,
        site_title: site_title || prev.site_title,
        site_subtitle: site_subtitle || prev.site_subtitle,
        subtitle_font: subtitle_font || prev.subtitle_font,
        subtitle_size: subtitle_size || prev.subtitle_size,
        subtitle_color: subtitle_color || prev.subtitle_color,
        accent_color: accent_color || prev.accent_color,
        font: font || prev.font,
        logo_position: logo_position || prev.logo_position,
        logo_margin_top: parseInt(logo_margin_top) || prev.logo_margin_top,
        logo_margin_left: parseInt(logo_margin_left) || prev.logo_margin_left,
        subtitle_margin_top: parseInt(subtitle_margin_top) || prev.subtitle_margin_top,
        subtitle_margin_left: parseInt(subtitle_margin_left) || prev.subtitle_margin_left,
        footer_text: footer_text || prev.footer_text
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    // Luister naar custom events van de slideshow
    const handleSlideChange = (e) => {
      setCurrentSlide(e.detail.currentSlide);
      setTotalSlides(e.detail.totalSlides);
    };

    window.addEventListener('slideshowProgress', handleSlideChange);
    return () => window.removeEventListener('slideshowProgress', handleSlideChange);
  }, []);

  // Load menu pages
  useEffect(() => {
    const loadMenuPages = async () => {
      try {
        const response = await api.get('/pages');
        const sortedMenuPages = response.data
          .filter(page => page.is_in_menu)
          .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
        setMenuPages(sortedMenuPages);
      } catch (error) {
        console.error('Fout bij laden menu pagina\'s:', error);
      }
    };

    loadMenuPages();
  }, []);

  // Update localStorage wanneer isExpanded verandert
  useEffect(() => {
    localStorage.setItem('appBarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Update localStorage wanneer barPosition verandert
  useEffect(() => {
    localStorage.setItem('appBarPosition', barPosition);
  }, [barPosition]);

  // Toggle functie die de balk uitklapt naar links
  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setBarPosition('full-left');
      window.dispatchEvent(new CustomEvent('barPositionChanged', { 
        detail: { position: 'full-left' } 
      }));
    } else {
      setIsExpanded(false);
      setBarPosition('top');
      window.dispatchEvent(new CustomEvent('barPositionChanged', { 
        detail: { position: 'top' } 
      }));
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: barPosition === 'full-left' ? 'row' : 'column', 
      minHeight: '100vh',
      bgcolor: 'transparent',
      position: 'relative'
    }}>
      <AppBar 
        position={barPosition === 'full-left' ? 'relative' : "sticky"}
        elevation={0}
        sx={{ 
          bgcolor: 'transparent',
          borderBottom: barPosition !== 'full-left' ? '1px solid' : 'none',
          borderRight: 'none',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          backdropFilter: barPosition === 'full-left' ? 'none' : 'blur(8px)',
          zIndex: barPosition === 'full-left' ? 200 : 1800,
          width: barPosition === 'full-left' ? '280px' : '100%',
          height: barPosition === 'full-left' ? '100vh' : 'auto'
        }}
      >
        <Toolbar sx={{ 
          display: 'flex',
          bgcolor: barPosition === 'full-left' 
          ? (theme.palette.mode === 'dark' 
            ? 'rgba(30, 30, 30, 0.9)'
            : 'rgba(60, 60, 60, 0.6)')
          : (theme.palette.mode === 'dark' 
              ? 'rgba(30, 30, 30, 0.9)'
              : 'rgba(60, 60, 60, 0.6)'),
          justifyContent: 'space-between',
          gap: 2,
          px: barPosition === 'full-left' ? 2 : { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          height: barPosition === 'full-left' ? '100%' : 64,
          flexDirection: barPosition === 'full-left' ? 'column' : 'row',
          zIndex: 1200
        }}>
          {/* Logo en Menu Box */}
          {settings.logo && (
            <Box
              sx={{
                bgcolor: 'transparent',
                borderRadius: 0,
                p: 2,
                boxShadow: 'none',
                display: 'flex',
                flexDirection: barPosition === 'full-left' ? 'column' : 'row',
                gap: 4,
                alignItems: barPosition === 'full-left' ? 'flex-start' : 'center',
                width: barPosition === 'full-left' ? '100%' : '100vw',
                minWidth: barPosition === 'full-left' ? '100%' : '100vw',
                height: barPosition === 'full-left' ? '100%' : '65px',
                position: barPosition === 'full-left' ? 'relative' : 'absolute',
                left: 0,
                top: barPosition === 'full-left' ? 0 : -1,
                zIndex: 1200,
                pr: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(-1px)'
              }}>
              {/* Logo en Subtitle */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: barPosition === 'full-left' ? 'column' : 'row',
                alignItems: barPosition === 'full-left' ? 'flex-start' : 'center',
                gap: barPosition === 'full-left' ? 0 : 4,
                zIndex: 1300,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <Box
                  component="img"
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
                  alt="Logo"
                  sx={{
                    height: barPosition === 'full-left' ? 80 : 60,
                    width: 'auto',
                    objectFit: 'contain',
                    transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                {settings.site_subtitle && barPosition === 'full-left' && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: settings.subtitle_color,
                      fontFamily: settings.subtitle_font,
                      fontSize: settings.subtitle_size,
                      textShadow: '0 0 10px rgba(0,0,0,0.5)',
                      mt: 1,
                      textAlign: 'center',
                      mb: 1
                    }}
                  >
                    {settings.site_subtitle}
                  </Typography>
                )}
              </Box>

              {barPosition === 'full-left' ? (
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  width: '100%',
                  justifyContent: 'space-between',
                  pl: 1
                }}>
                  {/* Menu Items */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 0.5,
                    pt: 1,
                    mt: 2,
                    alignItems: 'flex-start',
                    width: '100%',
                    zIndex: 1400,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {menuPages.map((page) => (
                      <Button
                        key={page.id}
                        component={RouterLink}
                        to={`/${page.slug}`}
                        startIcon={<ArrowForwardIosIcon sx={{ fontSize: 4 }} />}
                        sx={{ 
                          color: settings.subtitle_color,
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          fontFamily: settings.subtitle_font,
                          fontSize: settings.subtitle_size,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          width: '100%',
                          minHeight: 32,
                          py: 0.5,
                          pl: 1,
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        {page.title}
                      </Button>
                    ))}
                  </Box>

                  {/* Navigation */}
                  <Box sx={{ 
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    mt: 'auto',
                    pb: 2,
                    pl: 1,
                    zIndex: 1500
                  }}>
                    <Navigation isExpanded={isExpanded} onToggleExpand={handleToggle} />
                  </Box>
                </Box>
              ) : (
                <>
                  {/* Menu Items - Horizontaal */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    gap: 3,
                    ml: -2,
                    alignItems: 'center',
                    zIndex: 1400
                  }}>
                    {menuPages.map((page) => (
                      <Button
                        key={page.id}
                        component={RouterLink}
                        to={`/${page.slug}`}
                        startIcon={<ArrowForwardIosIcon sx={{ fontSize: 4 }} />}
                        sx={{ 
                          color: settings.subtitle_color,
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          fontFamily: settings.subtitle_font,
                          fontSize: settings.subtitle_size,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          py: 1,
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        {page.title}
                      </Button>
                    ))}
                  </Box>

                  {/* Navigation - Horizontaal */}
                  <Box sx={{ 
                    ml: 'auto',
                    display: 'flex',
                    zIndex: 1500
                  }}>
                    <Navigation isExpanded={isExpanded} onToggleExpand={handleToggle} />
                  </Box>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        position: 'relative'
      }}>
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
            ml: barPosition === 'full-left' ? '280px' : 0,
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            bgcolor: 'transparent'
          }}
        >
          <Outlet />
        </Container>

        <Box 
          component="footer" 
          sx={{ 
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: settings.logo_position === 'center' ? 'center' : 'flex-end',
            bgcolor: barPosition === 'full-left' 
            ? 'transparent'
            : theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(60, 60, 60, 0.6)',
            position: 'sticky',
            bottom: 0,
            ml: barPosition === 'full-left' ? '280px' : 0,
            width: barPosition === 'full-left' ? 'calc(100% - 280px)' : '100%',
            transition: theme.transitions.create(
              ['margin-left', 'width', 'background-color'], 
              {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut
              }
            ),
            backdropFilter: 'blur(8px)',
                     }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#fff' : '#000',
              fontSize: '0.9rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textAlign: settings.logo_position === 'center' ? 'center' : 'right',
              position: 'relative',
              zIndex: 1,
              textShadow: theme.palette.mode === 'dark'
                ? '0 1px 2px rgba(0,0,0,0.5), 0 1px 8px rgba(0,0,0,0.25)'
                : '0 1px 2px rgba(255,255,255,0.5), 0 1px 8px rgba(255,255,255,0.25)',
              mixBlendMode: theme.palette.mode === 'dark' ? 'lighten' : 'darken',
              width: settings.logo_position === 'center' ? '100%' : 'auto',
              px: 3,
              transition: theme.transitions.create(
                ['color', 'text-shadow'], 
                {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeInOut
                }
              )
            }}
          >
            {settings.footer_text}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 