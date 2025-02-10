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
    const location = useLocation();
    const isActive = location.pathname === (page.parent_id ? `/${page.parent_slug}/${page.slug}` : `/${page.slug}`);
    const [isHovered, setIsHovered] = useState(false);
    const hasChildren = page.children && page.children.length > 0;
    
    // Check of een van de subpagina's actief is
    const hasActiveChild = hasChildren && page.children.some(child => 
      location.pathname === `/${page.slug}/${child.slug}`
    );

    // Bepaal of het menu uitgeklapt moet zijn
    const shouldBeExpanded = barPosition === 'full-left' 
      ? expandedItems.has(page.id) || isActive || hasActiveChild
      : isHovered;

    const handleClick = (e) => {
      if (page.is_parent_only || (hasChildren && barPosition === 'full-left')) {
        e.preventDefault();
        handleToggleSubmenu(page.id);
      }
      if (!page.is_parent_only && (!hasChildren || barPosition !== 'full-left')) {
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
          component={page.is_parent_only ? 'button' : RouterLink}
          to={page.is_parent_only ? undefined : page.slug === 'home' ? '/' : `/${page.parent_id ? `${page.parent_slug}/${page.slug}` : page.slug}`}
          onClick={handleClick}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            pl: 2 + level * 2,
            pr: 2,
            py: 1,
            color: isActive || hasActiveChild 
              ? (settings?.accent_color || theme.palette.primary.main)
              : (theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000'),
            textTransform: 'none',
            fontSize: `${settings?.menu_font_size || 16}px`,
            fontWeight: isActive || hasActiveChild ? 500 : 400,
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          {page.title}
          {hasChildren && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              {shouldBeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
          )}
        </Button>

        {hasChildren && shouldBeExpanded && (
          <Box sx={{
            position: barPosition === 'full-left' ? 'relative' : 'absolute',
            top: barPosition === 'full-left' ? 'auto' : '100%',
            left: barPosition === 'full-left' ? 0 : level === 0 ? 0 : '100%',
            width: '100%',
            minWidth: 200,
            zIndex: barPosition === 'full-left' ? 1 : 1900,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(35, 35, 45, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: barPosition === 'full-left' ? 0 : 1,
            boxShadow: barPosition === 'full-left' ? 'none' : theme.shadows[8],
            backdropFilter: barPosition === 'full-left' ? 'none' : 'blur(8px)',
            border: barPosition === 'full-left' ? 'none' : '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
          }}>
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
      {/* Main Layout Container */}
      <AppBar 
        position={barPosition === 'full-left' ? 'relative' : "sticky"}
        elevation={0}
        sx={{ 
          bgcolor: barPosition === 'full-left' ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(35, 35, 45, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderBottom: barPosition !== 'full-left' ? 'none' : 'none',
          backdropFilter: barPosition === 'full-left' ? 'none' : 'blur(8px)',
          zIndex: barPosition === 'full-left' ? 200 : 1800,
          width: barPosition === 'full-left' ? '280px' : '100%',
          height: barPosition === 'full-left' ? '100vh' : 'auto',
          display: 'flex',
          flexDirection: barPosition === 'full-left' ? 'column' : 'row'
        }}
      >
        <Toolbar 
          sx={{ 
            width: '100%',
            height: barPosition === 'full-left' ? '100%' : '64px',
            minHeight: '64px !important',
            px: 3,
            py: 1,
            display: 'flex',
            flexDirection: barPosition === 'full-left' ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: barPosition === 'full-left' ? 'space-between' : 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0.5,
            width: barPosition === 'full-left' ? '100%' : 'auto',
            height: barPosition === 'full-left' ? 'auto' : '100%'
          }}>
            <Box
              component="img"
              src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
              alt={settings.site_title}
              sx={{
                height: 'auto',
                width: `${settings.logo_size || 60}px`,
                maxWidth: '100%',
                objectFit: 'contain',
                filter: settings.logo_shadow_enabled ? 
                  `drop-shadow(${settings.logo_shadow_x}px ${settings.logo_shadow_y}px ${settings.logo_shadow_blur}px ${hexToRgba(settings.logo_shadow_color, settings.logo_shadow_opacity)})` : 
                  'none'
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                color: settings.subtitle_color || 'text.primary',
                fontFamily: settings.subtitle_font || 'system-ui',
                fontSize: `${settings.subtitle_size || 14}px`,
                textAlign: 'left',
                width: '100%',
                whiteSpace: 'nowrap',
                filter: settings.subtitle_shadow_enabled ? 
                  `drop-shadow(${settings.subtitle_shadow_x}px ${settings.subtitle_shadow_y}px ${settings.subtitle_shadow_blur}px ${hexToRgba(settings.subtitle_shadow_color, settings.subtitle_shadow_opacity)})` : 
                  'none'
              }}
            >
              {settings.site_subtitle}
            </Typography>
          </Box>

          {/* Menu en Navigatie Container */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: barPosition === 'full-left' ? 'column' : 'row',
            alignItems: barPosition === 'full-left' ? 'stretch' : 'center',
            justifyContent: barPosition === 'full-left' ? 'space-between' : 'flex-end',
            flex: 1,
            width: '100%',
            height: barPosition === 'full-left' ? 'calc(100vh - 200px)' : '100%',
            ml: barPosition === 'full-left' ? 0 : 'auto'
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
                  flexDirection: barPosition === 'full-left' ? 'column' : 'row',
                  gap: barPosition === 'full-left' ? 0.5 : 3,
                  alignItems: barPosition === 'full-left' ? 'flex-start' : 'center',
                  flex: barPosition === 'full-left' ? 1 : 'unset',
                  mt: barPosition === 'full-left' ? 4 : 0,
                  mr: barPosition === 'full-left' ? 0 : 2,
                  width: '100%',
                  overflow: barPosition === 'full-left' ? 'auto' : 'visible'
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

            {/* Navigation Buttons */}
            {barPosition === 'full-left' && (
              <Box sx={{ 
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                pt: 2,
                mt: 'auto'
              }}>
                <Navigation isExpanded={isExpanded} onToggleExpand={handleToggle} />
              </Box>
            )}
          </Box>

          {barPosition !== 'full-left' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Navigation isExpanded={isExpanded} onToggleExpand={handleToggle} />
            </Box>
          )}
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
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: settings.logo_position === 'center' ? 'center' : 'flex-end',
            bgcolor: 'transparent',
            position: 'fixed',
            bottom: 0,
            left: barPosition === 'full-left' ? '280px' : 0,
            right: 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'none',
            zIndex: 1000
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: settings.footer_color || (theme.palette.mode === 'dark' ? '#fff' : '#000'),
              fontSize: `${settings.footer_size || 14}px`,
              fontFamily: settings.footer_font || 'system-ui',
              textAlign: settings.logo_position === 'center' ? 'center' : 'right',
              position: 'relative',
              zIndex: 1,
              width: settings.logo_position === 'center' ? '100%' : 'auto',
              px: 3
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