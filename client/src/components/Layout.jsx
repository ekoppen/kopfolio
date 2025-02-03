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
import { useSettings } from '../contexts/SettingsContext';

console.log('Layout.jsx wordt geladen!');

const Layout = () => {
  console.log('Layout component wordt gerenderd!');
  
  const theme = useTheme();
  const { settings } = useSettings();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition === 'full-left';
  });
  const [menuPages, setMenuPages] = useState([]);

  // Gebruik de opgeslagen positie als fallback voor de settings
  const barPosition = settings.logo_position || localStorage.getItem('appBarPosition') || 'top';
  
  // Update localStorage wanneer settings veranderen
  useEffect(() => {
    if (settings.logo_position) {
      localStorage.setItem('appBarPosition', settings.logo_position);
    }
  }, [settings.logo_position]);

  useEffect(() => {
    // Luister naar settings updates
    const handleSettingsUpdate = (event) => {
      const newSettings = event.detail;
      const newPosition = newSettings.logo_position;
      localStorage.setItem('appBarPosition', newPosition);
      window.dispatchEvent(new CustomEvent('barPositionChanged', { 
        detail: { position: newPosition } 
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  // Synchroniseer isExpanded met barPosition
  useEffect(() => {
    setIsExpanded(barPosition === 'full-left');
  }, [barPosition]);

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

  // Toggle functie die de balk uitklapt naar links
  const handleToggle = () => {
    const newPosition = !isExpanded ? 'full-left' : 'top';
    setIsExpanded(!isExpanded);
    localStorage.setItem('appBarPosition', newPosition);
    window.dispatchEvent(new CustomEvent('settingsUpdated', { 
      detail: { logo_position: newPosition } 
    }));
  };
  
  // Functie om hex kleur om te zetten naar rgba
  const hexToRgba = (hex, opacity = 1) => {
    // Verwijder de # als die aanwezig is
    hex = hex.replace('#', '');
    
    // Parse de hex waarden
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Functie om het juiste patroon te bepalen
  const getPatternStyle = () => {
    const pattern = settings.sidebar_pattern;
    if (!pattern || pattern === 'none') return {};

    // Als het een custom SVG patroon is
    if (pattern.endsWith('.svg')) {
      return {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}/patterns/${pattern})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${settings.pattern_scale * 100}%`,
          backgroundPosition: 'center',
          opacity: settings.pattern_opacity,
          pointerEvents: 'none',
          zIndex: 1
        }
      };
    }

    // Voor de ingebouwde patronen
    const patternOpacity = settings.pattern_opacity || 0.15; // Gebruik de ingestelde transparantie
    const baseColor = settings.pattern_color ? 
      hexToRgba(settings.pattern_color, 1) : // Gebruik volledige kleur, opacity wordt apart toegepast
      (theme.palette.mode === 'dark' ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)');
    const baseSize = 20 * (settings.pattern_scale || 1);
    
    
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: barPosition === 'full-left' ? 'row' : 'column', 
      minHeight: '100vh',
      bgcolor: 'transparent',
      position: 'relative',
      ...(settings.sidebar_pattern && settings.sidebar_pattern !== 'none' && {
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}/patterns/${settings.sidebar_pattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: `${settings.pattern_scale * 280}px`,
          backgroundPosition: 'center',
          opacity: settings.pattern_opacity,
          zIndex: -1,
          pointerEvents: 'none'
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: settings.pattern_color || '#FCF4FF',
          mixBlendMode: 'multiply',
          opacity: 0.5,
          zIndex: -1,
          pointerEvents: 'none'
        }
      })
    }}>
      {/* Fixed Logo Container */}
      {settings.logo && (
        <Box
          component="img"
          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
          alt="Logo"
          sx={{
            position: 'fixed',
            top: `${settings.logo_margin_top}px`,
            left: `${settings.logo_margin_left}px`,
            height: settings.logo_size || 60,
            width: 'auto',
            maxWidth: settings.logo_size * 2 || 120,
            objectFit: 'contain',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 2000,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))'
          }}
        />
      )}

      {/* Main Layout Container */}
      <AppBar 
        position={barPosition === 'full-left' ? 'relative' : "sticky"}
        elevation={0}
        sx={{ 
          bgcolor: 'transparent',
          backdropFilter: barPosition === 'full-left' ? 'none' : 'blur(8px)',
          zIndex: barPosition === 'full-left' ? 200 : 1800,
          width: barPosition === 'full-left' ? '280px' : '100%',
          height: barPosition === 'full-left' ? '100vh' : 'auto',
          position: 'relative',
          overflow: 'visible',
          ...(barPosition === 'full-left' && {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)'
          })
        }}
      >
        <Toolbar sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          px: barPosition === 'full-left' ? 2 : { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          height: barPosition === 'full-left' ? '100%' : 64,
          flexDirection: barPosition === 'full-left' ? 'column' : 'row',
          zIndex: 2,
          ml: barPosition === 'full-left' ? 0 : `${settings.logo_size * 1.5 + settings.logo_margin_left + 80}px`,
          width: barPosition === 'full-left' ? '100%' : 'auto',
          bgcolor: 'transparent'
        }}>
          {/* Logo en Menu Box */}
          <Box
            sx={{
              bgcolor: 'transparent',
              borderRadius: 0,
              p: 0,
              boxShadow: 'none',
              display: 'flex',
              flexDirection: barPosition === 'full-left' ? 'column' : 'row',
              gap: 4,
              alignItems: barPosition === 'full-left' ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: barPosition === 'full-left' ? '100%' : '65px',
              position: 'relative',
              zIndex: 1200
            }}>

            {barPosition === 'full-left' ? (
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%',
                justifyContent: 'space-between',
                pl: 1,
                mt: `${settings.logo_size + 40}px`,
                position: 'relative',
                zIndex: 1500
              }}>
                {/* Menu Items */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 0.5,
                  pt: 1,
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
                  alignItems: 'center',
                  zIndex: 1400,
                  flex: 1
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
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1500,
                  mr: 2
                }}>
                  <Navigation isExpanded={isExpanded} onToggleExpand={handleToggle} />
                </Box>
              </>
            )}
          </Box>
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
            py: 3,
            px: 2,
            mt: 'auto',
            bgcolor: 'transparent',
            zIndex: 2,
            position: 'relative'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#fff' : '#000',
              fontSize: '0.9rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textAlign: 'right',
              position: 'relative',
              zIndex: 1,
              textShadow: theme.palette.mode === 'dark'
                ? '0 1px 2px rgba(0,0,0,0.5), 0 1px 8px rgba(0,0,0,0.25)'
                : '0 1px 2px rgba(255,255,255,0.5), 0 1px 8px rgba(255,255,255,0.25)',
              mixBlendMode: theme.palette.mode === 'dark' ? 'lighten' : 'darken',
              width: 'auto',
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