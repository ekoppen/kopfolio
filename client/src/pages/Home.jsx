import React, { useState, useEffect, useRef } from 'react';
import { Box, useTheme, Typography } from '@mui/material';
import api from '../utils/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { 
  EffectFade, 
  EffectCreative, 
  EffectCards, 
  EffectCoverflow,
  Autoplay 
} from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-creative';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-coverflow';

const Home = () => {
  const theme = useTheme();
  const [photos, setPhotos] = useState([]);
  const [pageSettings, setPageSettings] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef(null);
  const [barPosition, setBarPosition] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition || 'top';
  });

  // Functie om afbeeldingen vooraf te laden
  const preloadImages = (imageUrls) => {
    imageUrls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, url]));
      };
      img.src = url;
    });
  };

  useEffect(() => {
    const loadHomeContent = async () => {
      try {
        // Haal de home pagina op voor de slideshow instellingen
        const pagesResponse = await api.get('/pages');
        const homePage = pagesResponse.data.find(page => page.slug === 'home');
        if (homePage) {
          setPageSettings(homePage.settings?.slideshow || {});
        }

        // Haal de foto's op
        const albumsResponse = await api.get('/albums');
        const homeAlbum = albumsResponse.data.find(album => album.is_home);
        
        if (homeAlbum) {
          const photosResponse = await api.get(`/photos/album/${homeAlbum.id}`);
          const newPhotos = photosResponse.data;
          setPhotos(newPhotos);

          // Start met preloaden van de afbeeldingen
          const imageUrls = newPhotos.map(photo => 
            `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`
          );
          preloadImages(imageUrls);
        }
      } catch (error) {
        console.error('Fout bij ophalen home content:', error);
      }
    };

    loadHomeContent();

    // Luister naar updates van de slideshow instellingen
    const handleSettingsUpdate = () => {
      loadHomeContent();
    };

    window.addEventListener('slideshowSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('slideshowSettingsUpdated', handleSettingsUpdate);
  }, []);

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

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      overflow: 'hidden',
      display: 'flex',
      bgcolor: 'transparent'
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: barPosition === 'full-left' ? '280px' : 0,
        right: 0,
        bottom: 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: barPosition === 'full-left' ? '32px' : 0,
        zIndex: 1
      }}>
        {photos.length > 0 && (
          <Box sx={{
            width: barPosition === 'full-left' ? 'calc(100% - 64px)' : '100%',
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: barPosition === 'full-left' ? '16px' : 0,
            overflow: 'hidden',
            boxShadow: barPosition === 'full-left' 
              ? theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.25)'
              : 'none',
            zIndex: 2
          }}>
            <Swiper
              ref={swiperRef}
              modules={[EffectFade, EffectCreative, EffectCards, EffectCoverflow, Autoplay]}
              effect={pageSettings?.transition || 'fade'}
              speed={pageSettings?.speed || 1000}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: pageSettings?.interval || 5000,
                disableOnInteraction: false,
                enabled: pageSettings?.autoPlay !== false
              }}
              pagination={false}
              navigation={false}
              onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
              creativeEffect={{
                prev: {
                  translate: [0, 0, -400],
                },
                next: {
                  translate: ['100%', 0, 0],
                },
              }}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              style={{
                width: '100%',
                height: '100%'
              }}
            >
              {photos.map((photo) => {
                const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`;
                return (
                  <SwiperSlide key={photo.id}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: loadedImages.has(imageUrl) ? 1 : 0,
                        transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Foto informatie in full-left weergave */}
            {barPosition === 'full-left' && photos[activeSlide] && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 32,
                  bottom: 32,
                  width: 280,
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
                  {photos[activeSlide].title || 'Geen titel'}
                </Typography>
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
        )}
      </Box>
    </Box>
  );
};

export default Home; 