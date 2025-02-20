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

const Page = () => {
  const theme = useTheme();
  const { settings } = useSettings();
  console.log('Current settings in Page:', settings);
  console.log('Background color from settings:', settings?.background_color);
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
      setBarPosition(event.detail.position);
    };

    window.addEventListener('barPositionChanged', updateBarPosition);
    
    // Initial position
    const savedPosition = localStorage.getItem('appBarPosition');
    if (savedPosition) {
      setBarPosition(savedPosition);
    }

    return () => window.removeEventListener('barPositionChanged', updateBarPosition);
  }, []);

  const handleSave = async () => {
    try {
      await api.put(`/pages/${page.id}`, {
        ...page,
        content: editedContent
      });
      setPage(prev => ({ ...prev, content: editedContent }));
      setIsEditing(false);
    } catch (error) {
      console.error('Fout bij opslaan:', error);
      setError('Fout bij opslaan van de pagina');
    }
  };

  const handleCancel = () => {
    setEditedContent(page.content);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!page) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Pagina niet gevonden
      </Alert>
    );
  }

  if (page.is_fullscreen_slideshow) {
    const slideshowContent = (
      <Box sx={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        <Swiper
          modules={[EffectFade, EffectCreative, EffectCards, EffectCoverflow, Autoplay]}
          effect={page.settings?.slideshow?.transition || 'fade'}
          speed={page.settings?.slideshow?.speed || 1000}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: page.settings?.slideshow?.interval || 5000,
            disableOnInteraction: false,
            enabled: page.settings?.slideshow?.autoPlay !== false
          }}
          pagination={false}
          navigation={false}
          onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0
          }}
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={index}>
              <img
                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`}
                alt={photo.title || 'Geen titel'}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  backgroundColor: 'transparent'
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {photos[activeSlide] && (photos[activeSlide].title || photos[activeSlide].description) && (
          <Box
            sx={{
              position: 'absolute',
              left: 24,
              bottom: 24,
              width: 320,
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(0, 0, 0, 0.85)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.25)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 3
            }}
          >
            {photos[activeSlide].title && (
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  mb: 1,
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.95)' 
                    : 'rgba(0, 0, 0, 0.95)'
                }}
              >
                {photos[activeSlide].title}
              </Typography>
            )}
            {photos[activeSlide].description && (
              <Typography 
                variant="body2" 
                sx={{
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : 'rgba(0, 0, 0, 0.7)'
                }}
              >
                {photos[activeSlide].description}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );

    if (barPosition === 'full-left') {
      return (
        <Box sx={{ 
          position: 'fixed',
          top: '16px',
          left: '296px',
          right: '16px',
          bottom: '16px',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            bgcolor: settings.background_color || page.settings?.background_color || 'transparent'
          }}>
            {slideshowContent}
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        position: 'fixed',
        top: barPosition === 'top' ? '64px' : 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {slideshowContent}
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
      overflow: 'auto',
      bgcolor: 'transparent',
      zIndex: 0
    }}>
      {!settings.background_color && page.settings?.pattern && (
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
            zIndex: 1
          }}
        />
      )}
      {barPosition === 'full-left' ? (
        <Box sx={{ 
          position: 'fixed',
          top: '16px',
          left: '296px',
          right: '16px',
          bottom: '16px',
          overflow: 'hidden',
          zIndex: 2,
          bgcolor: 'transparent'
        }}>
          <Box sx={{ 
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(35, 35, 45, 0.98)' : '#ffffff',
            '& .dashed-border': {
              border: '2px dashed',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'
            },
            '& .block-controls': {
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(35, 35, 45, 0.95)' : '#ffffff',
              '& .MuiIconButton-root': {
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
              }
            },
            '& .MuiTextField-root, & .MuiSelect-root': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
              },
              '& .MuiInputBase-input': {
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
              }
            },
            '& .spacer-block': {
              border: '1px dashed',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            }
          }}>
            <PageContent 
              content={page.content} 
              isFullscreenSlideshow={page.is_fullscreen_slideshow}
              onSlideChange={setActiveSlide}
              photos={photos}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={{ 
          height: '100%',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          zIndex: 2,
          bgcolor: 'transparent'
        }}>
          <Box sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: 0,
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(35, 35, 45, 0.98)'
              : '#ffffff',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255, 255, 255, 0.1)'
              : 'none'
          }}>
            <PageContent 
              content={page.content} 
              isFullscreenSlideshow={page.is_fullscreen_slideshow}
              onSlideChange={setActiveSlide}
              photos={photos}
            />
          </Box>
        </Box>
      )}
      {/* Foto informatie in fullscreen slideshow */}
      {page.settings?.slideshow?.show_info && photos[activeSlide] && 
       (photos[activeSlide].title || photos[activeSlide].description) && (
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            bottom: 24,
            width: 320,
            p: 2.5,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.85)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.25)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 3
          }}
        >
          {photos[activeSlide].title && (
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontSize: '1.1rem',
                fontWeight: 500,
                mb: 1,
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.95)' 
                  : 'rgba(0, 0, 0, 0.95)'
              }}
            >
              {photos[activeSlide].title}
            </Typography>
          )}
          {photos[activeSlide].description && (
            <Typography 
              variant="body2" 
              sx={{
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(0, 0, 0, 0.7)'
              }}
            >
              {photos[activeSlide].description}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Page; 