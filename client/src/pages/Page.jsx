import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Container,
  AppBar,
  Toolbar,
  Button,
  Fab,
  useTheme,
  Paper
} from '@mui/material';
import {
  TextFields as TextIcon,
  Image as ImageIcon,
  Collections as SlideshowIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, EffectCreative, EffectCards, EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-creative';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-coverflow';
import PageContent from '../components/PageContent';
import PageContentEditor from '../components/PageContentEditor';
import api from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';

// Functie om hex kleur naar rgba te converteren
const hexToRgba = (hex, opacity) => {
  if (!hex) return 'transparent';
  
  // Verwijder # indien aanwezig
  hex = hex.replace('#', '');
  
  // Converteer 3-cijferige hex naar 6-cijferige
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Converteer hex naar rgb
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Retourneer rgba
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const Page = () => {
  const theme = useTheme();
  const { settings } = useSettings();
  const { slug, parentSlug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [activeSlide, setActiveSlide] = useState(0);
  const isAdmin = !!localStorage.getItem('token');
  const [barPosition, setBarPosition] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition || 'top';
  });

  // Preload images voor betere performance
  const preloadImages = (imageUrls) => {
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  };

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError('');
        let response;
        if (parentSlug) {
          response = await api.get(`/pages/${parentSlug}/${slug}`);
        } else {
          response = await api.get(`/pages/${slug}`);
        }
        setPage(response.data);

        // Als het een fullscreen slideshow is, laad dan de foto's
        if (response.data.is_fullscreen_slideshow && response.data.settings?.slideshow?.albumId) {
          console.log('Fullscreen slideshow detected, loading photos from album:', response.data.settings.slideshow.albumId);
          try {
            const photosResponse = await api.get(`/photos/album/${response.data.settings.slideshow.albumId}`);
            console.log('Photos loaded:', photosResponse.data);
            setPhotos(photosResponse.data);
          } catch (error) {
            console.error('Error loading photos for slideshow:', error);
          }
        }

        // Preload afbeeldingen uit de content
        const imageUrls = response.data.content
          .filter(block => block.type === 'image' || block.type === 'slideshow')
          .flatMap(block => {
            if (block.type === 'image') {
              // Controleer of block.content bestaat en een filename heeft
              return block.content && block.content.filename 
                ? [`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${block.content.filename}`]
                : [];
            } else if (block.type === 'slideshow' && Array.isArray(block.content)) {
              return block.content
                .filter(photo => photo && photo.filename)
                .map(photo => 
                  `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`
                );
            }
            return [];
          });
        preloadImages(imageUrls);
      } catch (error) {
        console.error('Fout bij ophalen pagina:', error);
        setError('Fout bij ophalen pagina');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, parentSlug]);

  // Luister naar veranderingen in barPosition
  useEffect(() => {
    const updateBarPosition = (event) => {
      console.log('Bar position changed to:', event.detail.position);
      setBarPosition(event.detail.position);
      
      // Force re-render om de achtergrondkleur overlay bij te werken
      setPage(prevPage => ({...prevPage}));
    };

    window.addEventListener('barPositionChanged', updateBarPosition);
    
    // Initial position
    const savedPosition = localStorage.getItem('appBarPosition');
    if (savedPosition) {
      setBarPosition(savedPosition);
    }

    return () => window.removeEventListener('barPositionChanged', updateBarPosition);
  }, []);

  const handleSave = async (content) => {
    try {
      await api.put(`/pages/${page._id}`, {
        ...page,
        content
      });
      setPage({
        ...page,
        content
      });
      setIsEditing(false);
      setEditedContent(null);
    } catch (error) {
      console.error('Fout bij opslaan pagina:', error);
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      top: barPosition === 'top' ? '64px' : 0,
      left: barPosition === 'full-left' ? '280px' : 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      bgcolor: 'transparent'
    }}>
      {/* Patroon achtergrond */}
      {page?.settings?.pattern && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(/patterns/${page.settings.pattern})`,
            backgroundRepeat: 'repeat',
            backgroundSize: page.settings?.pattern_scale ? `${page.settings.pattern_scale}px` : '200px',
            backgroundPosition: 'center center',
            opacity: page.settings?.pattern_opacity !== undefined ? page.settings.pattern_opacity : 1,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : page ? (
        <>
          {/* Als het een fullscreen slideshow is, toon dan alleen de PageContent component */}
          {page.is_fullscreen_slideshow ? (
            // Fullscreen slideshow layout
            barPosition === 'full-left' ? (
              // In full-left mode, toon de slideshow in een vlak
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                bgcolor: 'transparent'
              }}>
                <Box sx={{
                  width: 'calc(100% - 64px)',
                  height: '100%',
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0,0,0,0.5)'
                    : '0 8px 32px rgba(0,0,0,0.25)',
                  bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f8f8',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <PageContent 
                    content={page.content} 
                    isFullscreenSlideshow={true}
                    photos={photos}
                    onSlideChange={setActiveSlide}
                  />
                </Box>
              </Box>
            ) : (
              // In top mode, toon de slideshow beeldvullend
              <PageContent 
                content={page.content} 
                isFullscreenSlideshow={true}
                photos={photos}
                onSlideChange={setActiveSlide}
              />
            )
          ) : (
            // Gewone pagina layout
            <Box sx={{ 
              position: 'relative',
              height: '100%',
              width: '100%',
              zIndex: 2
            }}>
              {barPosition === 'full-left' ? (
                // In full-left mode, toon de pagina in een vlak
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px',
                  bgcolor: 'transparent'
                }}>
                  <Box sx={{
                    width: 'calc(100% - 64px)',
                    height: '100%',
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'auto',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 32px rgba(0,0,0,0.5)'
                      : '0 8px 32px rgba(0,0,0,0.25)',
                    bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f8f8',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {page.title && (
                      <Box sx={{ p: 4, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
                          {page.title}
                        </Typography>
                        {page.description && (
                          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                            {page.description}
                          </Typography>
                        )}
                      </Box>
                    )}
                    <Box sx={{ p: 4 }}>
                      <PageContent 
                        content={page.content} 
                        isFullscreenSlideshow={false}
                        photos={photos}
                        onSlideChange={setActiveSlide}
                      />
                    </Box>
                  </Box>
                </Box>
              ) : (
                // In top mode, toon de pagina gecentreerd
                <Box sx={{ 
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  pt: 4,
                  pb: 4,
                  overflow: 'auto',
                  bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f0f0f0',
                  marginTop: 0 // Zorg ervoor dat er geen onbedoelde marge is
                }}>
                  <Container maxWidth="lg" sx={{ width: '100%' }}>
                    <Paper sx={{
                      width: '100%',
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0,0,0,0.5)'
                        : '0 8px 32px rgba(0,0,0,0.25)',
                      bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f8f8',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      {page.title && (
                        <Box sx={{ p: 4, borderBottom: 1, borderColor: 'divider' }}>
                          <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
                            {page.title}
                          </Typography>
                          {page.description && (
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                              {page.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                      <Box sx={{ p: 4 }}>
                        <PageContent 
                          content={page.content} 
                          isFullscreenSlideshow={false}
                          photos={photos}
                          onSlideChange={setActiveSlide}
                        />
                      </Box>
                    </Paper>
                  </Container>
                </Box>
              )}
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Pagina niet gevonden</Alert>
        </Box>
      )}
    </Box>
  );
};

export default Page; 