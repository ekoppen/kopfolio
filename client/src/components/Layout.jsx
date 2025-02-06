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
  IconButton,
  List,
  ListItem,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import Navigation from './Navigation';
import api from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

console.log('Layout.jsx wordt geladen!');

const Layout = () => {
  console.log('Layout component wordt gerenderd!');
  
  const theme = useTheme();
  const { settings, setSettings } = useSettings();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);
  const [patterns, setPatterns] = useState([]);
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition === 'full-left';
  });
  const [pages, setPages] = useState([]);
  const [menuPages, setMenuPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [activeId, setActiveId] = useState(null);

  // Gebruik de opgeslagen positie als fallback voor de settings
  const barPosition = settings.logo_position || localStorage.getItem('appBarPosition') || 'top';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    // Luister naar pattern updates
    const handlePatternUpdate = (event) => {
      const newPatternSettings = event.detail;
      setSettings(prev => ({
        ...prev,
        ...newPatternSettings
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    window.addEventListener('patternSettingsUpdated', handlePatternUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      window.removeEventListener('patternSettingsUpdated', handlePatternUpdate);
    };
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
        setPages(response.data);
        setMenuPages(sortedMenuPages);
      } catch (error) {
        console.error('Fout bij laden menu pagina\'s:', error);
      }
    };

    loadMenuPages();
  }, []);

  // Laad de patronen
  useEffect(() => {
    const loadPatterns = async () => {
      try {
        const response = await api.get('/settings/patterns');
        setPatterns(response.data);
      } catch (error) {
        console.error('Fout bij laden patronen:', error);
        setPatterns([]);
      }
    };
    loadPatterns();
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
  
  // Bepaal de tekstkleur op basis van de achtergrond in full-left modus
  const getTextColor = () => {
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };

  // Functie om hex kleur om te zetten naar rgba
  const hexToRgba = (hex, opacity = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${opacity})`;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Functie om te bepalen of een kleur licht of donker is
  const isLightColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Berekenen van de relatieve helderheid volgens WCAG richtlijnen
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Bepaal de tekstkleur op basis van de achtergrond
  const getContrastColor = (bgColor) => {
    return isLightColor(bgColor) ? '#000000' : '#FFFFFF';
  };

  // Functie om het juiste patroon te bepalen
  const getPatternStyle = () => {
    if (!settings?.sidebar_pattern) return {};

    const pattern = patterns.find(p => p.value === settings.sidebar_pattern);
    if (!pattern) return {};

    return {
      backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}${pattern.preview})`,
      backgroundSize: pattern.type === 'svg'
        ? `${settings.pattern_scale * 280}px`
        : `${Math.max(settings.pattern_scale * 25, 10)}%`,
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      opacity: settings.pattern_opacity,
      backgroundColor: settings.pattern_color || '#FCF4FF',
      imageRendering: pattern.type === 'svg' ? 'auto' : 'crisp-edges'
    };
  };

  // Bereken de tekstkleur op basis van de achtergrondkleur
  const textColor = settings?.pattern_color ? 
    getContrastColor(settings.pattern_color) : 
    theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';

  const MenuItem = ({ page, level = 0, selectedPage, onPageSelect }) => {
    const theme = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const hasChildren = page.children && page.children.length > 0;

    const getTextColor = () => {
      if (settings?.logo_position === 'full-left') {
        return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
      }
      return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    };

    const handleClick = (e) => {
      if (hasChildren) {
        e.preventDefault();
        if (page.is_parent_only) {
          setDropdownOpen(!dropdownOpen);
        }
      }
      if (!page.is_parent_only) {
        onPageSelect(page);
      }
    };

    return (
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          width: '100%'
        }}
      >
        <Button
          component={page.is_parent_only ? 'div' : RouterLink}
          to={page.is_parent_only ? undefined : `/pagina/${page.slug}`}
          onClick={handleClick}
          endIcon={hasChildren ? (
            isExpanded ? (
              dropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )
          ) : null}
          sx={{
            color: getTextColor(),
            textAlign: 'left',
            justifyContent: 'flex-start',
            pl: isExpanded ? 2 + level * 2 : 2,
            py: 1,
            width: '100%',
            fontSize: `${settings?.menu_font_size || 16}px`,
            fontWeight: selectedPage?.id === page.id ? 500 : 400,
            opacity: selectedPage?.id === page.id ? 1 : 0.9,
            textTransform: 'none',
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              opacity: 1
            }
          }}
        >
          {page.title}
        </Button>
        
        {hasChildren && (
          isExpanded ? (
            // Full-left weergave: uitklapbaar menu
            <Box
              sx={{
                maxHeight: dropdownOpen ? '500px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out',
                ml: 2
              }}
            >
              {page.children.map((childPage) => (
                <MenuItem
                  key={childPage.id}
                  page={childPage}
                  level={level + 1}
                  selectedPage={selectedPage}
                  onPageSelect={onPageSelect}
                />
              ))}
            </Box>
          ) : (
            // Top weergave: dropdown menu
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                minWidth: '200px',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
                boxShadow: theme.shadows[4],
                borderRadius: 1,
                opacity: dropdownOpen || isHovered ? 1 : 0,
                visibility: dropdownOpen || isHovered ? 'visible' : 'hidden',
                transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
                zIndex: 1000,
              }}
            >
              {page.children.map((childPage) => (
                <MenuItem
                  key={childPage.id}
                  page={childPage}
                  level={0}
                  selectedPage={selectedPage}
                  onPageSelect={onPageSelect}
                />
              ))}
            </Box>
          )
        )}
      </Box>
    );
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    try {
      // Update de parent_id van de versleepte pagina
      await api.put(`/pages/${active.id}`, {
        parent_id: over.id
      });

      // Herlaad de pagina's om de nieuwe structuur te tonen
      await loadMenuPages();
    } catch (error) {
      console.error('Fout bij updaten pagina structuur:', error);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleToggleSubmenu = (pageId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
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
          backgroundSize: settings.sidebar_pattern.endsWith('.svg')
            ? `${settings.pattern_scale * 280}px`
            : `${Math.max(settings.pattern_scale * 25, 10)}%`,
          backgroundPosition: 'center',
          opacity: settings.pattern_opacity,
          zIndex: -1,
          pointerEvents: 'none',
          imageRendering: settings.sidebar_pattern.endsWith('.svg') ? 'auto' : 'crisp-edges'
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : settings.pattern_color || '#FCF4FF',
          mixBlendMode: theme.palette.mode === 'dark' ? 'color' : 'multiply',
          opacity: theme.palette.mode === 'dark' ? 1 : 0.5,
          zIndex: -1,
          pointerEvents: 'none'
        }
      })
    }}>
      {/* Fixed Logo Container */}
      {settings.logo && (
        <Box sx={{
          position: 'fixed',
          top: `${settings.logo_margin_top}px`,
          left: `${settings.logo_margin_left}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1,
          zIndex: 2000,
        }}>
          <Box
            component="img"
            src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
            alt="Logo"
            sx={{
              height: settings.logo_size || 60,
              width: 'auto',
              maxWidth: settings.logo_size * 2 || 120,
              objectFit: 'contain',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))'
            }}
          />
          {settings.site_subtitle && (
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: settings.subtitle_font,
                fontSize: `${settings.subtitle_size}px`,
                color: settings.subtitle_color,
                mt: `${settings.subtitle_margin_top}px`,
                ml: `${settings.subtitle_margin_left}px`,
                textShadow: settings.subtitle_shadow_enabled ? 
                  `${settings.subtitle_shadow_x}px ${settings.subtitle_shadow_y}px ${settings.subtitle_shadow_blur}px ${hexToRgba(settings.subtitle_shadow_color, settings.subtitle_shadow_opacity)}` : 
                  'none'
              }}
            >
              {settings.site_subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Main Layout Container */}
      <AppBar 
        position={barPosition === 'full-left' ? 'relative' : "sticky"}
        elevation={0}
        sx={{ 
          bgcolor: 'transparent',
          backdropFilter: 'none',
          zIndex: barPosition === 'full-left' ? 200 : 1800,
          width: barPosition === 'full-left' ? '280px' : '100%',
          height: barPosition === 'full-left' ? '100vh' : 'auto',
          position: 'relative',
          overflow: 'visible',
          borderBottom: barPosition === 'full-left' 
            ? 'none' 
            : `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          boxShadow: barPosition === 'full-left'
            ? 'none'
            : theme.palette.mode === 'dark'
              ? '0 4px 30px rgba(0, 0, 0, 0.5)'
              : '0 4px 30px rgba(0, 0, 0, 0.1)',
          ...(barPosition === 'full-left' && {
            backdropFilter: 'none',
            boxShadow: 'none'
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
          width: '100%',
          bgcolor: barPosition === 'full-left' 
            ? 'transparent'
            : theme.palette.mode === 'dark' 
              ? 'rgba(18, 18, 18, 0.6)'
              : 'rgba(255, 255, 255, 0.4)',
          backdropFilter: barPosition === 'full-left' ? 'none' : 'blur(6px)'
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
              zIndex: 1200,
              ml: barPosition === 'full-left' ? 0 : `${settings.logo_size * 1.5 + settings.logo_margin_left + 80}px`
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={pages.filter(page => !page.parent_id).map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
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
                      {pages
                        .filter(page => !page.parent_id)
                        .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0))
                        .map(page => (
                          <MenuItem
                            key={page.id}
                            page={page}
                            selectedPage={selectedPage}
                            onPageSelect={setSelectedPage}
                          />
                        ))}
                    </Box>
                  </SortableContext>
                </DndContext>

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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={pages.filter(page => !page.parent_id).map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      gap: 3,
                      alignItems: 'center',
                      zIndex: 1400,
                      flex: 1
                    }}>
                      {pages
                        .filter(page => !page.parent_id)
                        .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0))
                        .map(page => (
                          <MenuItem
                            key={page.id}
                            page={page}
                            selectedPage={selectedPage}
                            onPageSelect={setSelectedPage}
                          />
                        ))}
                    </Box>
                  </SortableContext>
                </DndContext>

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
        height: barPosition === 'full-left' ? '100vh' : 'calc(100vh - 64px)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
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
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'auto'
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
        </Container>
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 4,
            bgcolor: 'transparent',
            zIndex: 2,
            position: 'fixed',
            bottom: 32,
            right: 64,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              fontSize: '0.75rem',
              textAlign: 'right',
              position: 'relative',
              zIndex: 1,
              width: 'auto',
              whiteSpace: 'nowrap'
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