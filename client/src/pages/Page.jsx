import React, { useState, useEffect, useRef } from 'react';
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
  useTheme
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

// Functie om de dominante kleur uit een afbeelding te halen
const getDominantColor = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorCounts = {};
        let maxCount = 0;
        let dominantColor = '#000000';
        
        // Sample pixels (elke 10e pixel voor performance)
        for (let i = 0; i < imageData.length; i += 40) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          
          // Converteer naar hex
          const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          
          // Tel de kleur
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          
          // Update dominante kleur
          if (colorCounts[hex] > maxCount) {
            maxCount = colorCounts[hex];
            dominantColor = hex;
          }
        }
        
        resolve(dominantColor);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    img.src = imageUrl;
  });
};

const Page = () => {
  const theme = useTheme();
  const { settings, updateSettingsLocally } = useSettings();
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
  // Referentie voor het bijhouden van de vorige dominante kleur
  const prevDominantColorRef = useRef(null);

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
          const photosResponse = await api.get(`/photos/album/${response.data.settings.slideshow.albumId}`);
          setPhotos(photosResponse.data);
        }

        // Preload afbeeldingen uit de content
        const imageUrls = response.data.content
          .filter(block => block.type === 'image' || block.type === 'slideshow')
          .flatMap(block => {
            if (block.type === 'image') {
              return [`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${block.photo.filename}`];
            } else if (block.type === 'slideshow') {
              return block.content.map(photo => 
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

  // Update de achtergrondkleur wanneer de actieve slide verandert
  useEffect(() => {
    const updateBackgroundColor = async () => {
      // Controleer of dynamische achtergrondkleur is ingeschakeld
      if (settings?.use_dynamic_background_color && photos.length > 0 && page?.is_fullscreen_slideshow) {
        try {
          const activePhoto = photos[activeSlide];
          if (activePhoto) {
            const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${activePhoto.filename}`;
            const dominantColor = await getDominantColor(imageUrl);
            
            console.log('Dominante kleur uit foto (Page):', dominantColor);
            
            // Alleen updaten als de kleur is veranderd
            if (prevDominantColorRef.current !== dominantColor) {
              // Update de referentie naar de huidige dominante kleur
              prevDominantColorRef.current = dominantColor;
              
              // Update de achtergrondkleur in de settings
              updateSettingsLocally({
                background_color: dominantColor
              });
            }
          }
        } catch (error) {
          console.error('Fout bij ophalen dominante kleur:', error);
        }
      }
    };
    
    updateBackgroundColor();
  }, [activeSlide, photos, settings?.use_dynamic_background_color, page?.is_fullscreen_slideshow]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!page) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Pagina niet gevonden</Alert>
      </Box>
    );
  }

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
      
      {isAdmin && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          zIndex: 1000 
        }}>
          <Fab 
            color="primary" 
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setEditedContent(null);
              } else {
                setIsEditing(true);
                setEditedContent(page.content);
              }
            }}
          >
            {isEditing ? <CloseIcon /> : <EditIcon />}
          </Fab>
        </Box>
      )}

      {isEditing ? (
        <PageContentEditor 
          initialContent={page.content} 
          onSave={handleSave} 
          onCancel={() => {
            setIsEditing(false);
            setEditedContent(null);
          }}
        />
      ) : (
        <Box sx={{ 
          position: 'relative',
          height: '100%',
          width: '100%',
          zIndex: 2
        }}>
          {barPosition === 'full-left' ? (
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
                bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <PageContent 
                  content={page.content} 
                  isFullscreenSlideshow={page.is_fullscreen_slideshow}
                  photos={photos}
                  onSlideChange={setActiveSlide}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              height: '100%',
              width: '100%',
              position: 'relative'
            }}>
              <PageContent 
                content={page.content} 
                isFullscreenSlideshow={page.is_fullscreen_slideshow}
                photos={photos}
                onSlideChange={setActiveSlide}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Page; 