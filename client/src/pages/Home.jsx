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
import { useSettings } from '../contexts/SettingsContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-creative';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-coverflow';

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
const getDominantColor = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    
    img.onload = () => {
      // Canvas maken om de afbeelding te tekenen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Canvas grootte instellen (klein voor betere performance)
      canvas.width = 50;
      canvas.height = 50;
      
      // Afbeelding tekenen op canvas
      ctx.drawImage(img, 0, 0, 50, 50);
      
      // Pixel data ophalen
      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      
      // Kleur tellen
      const colorCounts = {};
      let maxCount = 0;
      let dominantColor = '#000000';
      
      // Loop door alle pixels (4 waarden per pixel: r, g, b, a)
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        
        // Sla transparante pixels over
        if (a < 128) continue;
        
        // Maak een kleursleutel (afgerond naar 10-tallen voor minder variatie)
        const roundedR = Math.round(r / 10) * 10;
        const roundedG = Math.round(g / 10) * 10;
        const roundedB = Math.round(b / 10) * 10;
        const key = `${roundedR},${roundedG},${roundedB}`;
        
        // Tel de kleur
        colorCounts[key] = (colorCounts[key] || 0) + 1;
        
        // Bijwerken als dit de meest voorkomende kleur is
        if (colorCounts[key] > maxCount) {
          maxCount = colorCounts[key];
          dominantColor = `#${roundedR.toString(16).padStart(2, '0')}${roundedG.toString(16).padStart(2, '0')}${roundedB.toString(16).padStart(2, '0')}`;
        }
      }
      
      resolve(dominantColor);
    };
    
    img.onerror = () => {
      reject(new Error('Fout bij laden afbeelding'));
    };
  });
};

const Home = () => {
  const theme = useTheme();
  const { settings, updateSettingsLocally } = useSettings();
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
      console.log('Home: Bar position changed to:', event.detail.position);
      setBarPosition(event.detail.position);
      
      // Force re-render om de achtergrondkleur overlay bij te werken
      setPhotos(prevPhotos => [...prevPhotos]);
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
  const prevDominantColorRef = useRef(null);
  
  useEffect(() => {
    const updateBackgroundColor = async () => {
      // Controleer of dynamische achtergrondkleur is ingeschakeld
      if (settings?.use_dynamic_background_color && photos.length > 0) {
        try {
          const activePhoto = photos[activeSlide];
          if (activePhoto) {
            const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${activePhoto.filename}`;
            const dominantColor = await getDominantColor(imageUrl);
            
            // Alleen updaten als de kleur is veranderd
            if (prevDominantColorRef.current !== dominantColor) {
              console.log('Dominante kleur uit foto gewijzigd van', prevDominantColorRef.current, 'naar', dominantColor);
              
              // Update de achtergrondkleur in de settings
              updateSettingsLocally({
                background_color: dominantColor
              });
              
              // Sla de nieuwe kleur op in de ref
              prevDominantColorRef.current = dominantColor;
            }
          }
        } catch (error) {
          console.error('Fout bij ophalen dominante kleur:', error);
        }
      }
    };
    
    updateBackgroundColor();
  }, [activeSlide, photos, settings?.use_dynamic_background_color, updateSettingsLocally]);

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
      {/* Patroon achtergrond */}
      {settings?.sidebar_pattern && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(/patterns/${settings.sidebar_pattern})`,
            backgroundRepeat: 'repeat',
            backgroundSize: settings?.pattern_scale ? `${settings.pattern_scale * 25}%` : '200px',
            backgroundPosition: 'center center',
            opacity: settings?.pattern_opacity !== undefined ? settings.pattern_opacity : 0.15,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}
      
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
        zIndex: 2
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
                ? '0 8px 32px rgba(0,0,0,0.8)'
                : '0 8px 32px rgba(0,0,0,0.25)'
              : 'none',
            zIndex: 2,
            // Donkere overlay in dark mode
            '&::after': theme.palette.mode === 'dark' ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 3,
              pointerEvents: 'none'
            } : {}
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
            {barPosition === 'full-left' && photos[activeSlide] && 
             pageSettings?.show_info && (photos[activeSlide].title || photos[activeSlide].description) && (
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
                  zIndex: 10
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
        )}
      </Box>
    </Box>
  );
};

export default Home; 