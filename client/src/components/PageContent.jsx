import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  useTheme
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { 
  EffectFade, 
  EffectCreative, 
  EffectCards, 
  EffectCoverflow,
  Autoplay 
} from 'swiper/modules';
import { useSettings } from '../contexts/SettingsContext';
import { ContactForm } from '../pages/Contact';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-creative';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-coverflow';

const getImageWidth = (size) => {
  switch (size) {
    case 'small': return '600px';
    case 'medium': return '800px';
    case 'large': return '1000px';
    case 'full': return '100%';
    default: return '800px';
  }
};

const getAspectRatioPadding = (ratio) => {
  switch (ratio) {
    case '16:9':
      return '56.25%'; // (9 / 16 * 100)
    case '4:3':
      return '75%'; // (3 / 4 * 100)
    case '1:1':
      return '100%';
    case '3:4':
      return '133.33%'; // (4 / 3 * 100)
    default:
      return '56.25%'; // Default naar 16:9
  }
};

const PageContent = ({ 
  content = [], 
  isFullscreenSlideshow = false,
  onSlideChange,
  photos: externalPhotos
}) => {
  const { settings } = useSettings();
  const theme = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [barPosition, setBarPosition] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition || 'top';
  });

  // Voorkom rechtermuisklik op afbeeldingen
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Voorkom drag & drop van afbeeldingen
  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

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

  // Preload images voor betere performance
  useEffect(() => {
    if (isFullscreenSlideshow) {
      const photos = externalPhotos || content.find(block => block.type === 'slideshow')?.content || [];
      const imageUrls = photos.map(photo =>
        `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`
      );
      imageUrls.forEach(url => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]));
        };
        img.src = url;
      });
    }
  }, [content, isFullscreenSlideshow, externalPhotos]);

  // Als het een fullscreen slideshow is, toon dan de slideshow
  if (isFullscreenSlideshow) {
    const photos = externalPhotos || content.find(block => block.type === 'slideshow')?.content || [];
    const settings = content.find(block => block.type === 'slideshow')?.settings || {};

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'black',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Swiper
          modules={[EffectFade, EffectCreative, EffectCards, EffectCoverflow, Autoplay]}
          effect={settings?.transition || 'fade'}
          speed={settings?.speed || 1000}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: settings?.interval || 5000,
            disableOnInteraction: false,
            enabled: settings?.autoPlay !== false
          }}
          pagination={false}
          navigation={false}
          onSlideChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
            if (onSlideChange) {
              onSlideChange(swiper.realIndex);
            }
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {photos.map((photo) => {
            const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`;
            return (
              <SwiperSlide 
                key={photo.id}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: loadedImages.has(imageUrl) ? 1 : 0,
                    transition: 'opacity 1s ease'
                  }}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>
    );
  }

  // Render een slideshow blok
  const renderSlideshow = (block, index) => {
    const { settings: blockSettings = {}, album_id } = block;
    const [photos, setPhotos] = useState([]);
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

    // Haal foto's op voor het album
    useEffect(() => {
      const loadPhotos = async () => {
        if (!album_id) return;
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/photos/album/${album_id}`);
          const data = await response.json();
          setPhotos(data);
          
          // Start met preloaden van de afbeeldingen
          const imageUrls = data.map(photo => 
            `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`
          );
          preloadImages(imageUrls);
        } catch (error) {
          console.error('Fout bij ophalen foto\'s:', error);
        }
      };
      
      loadPhotos();
    }, [album_id]);

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
      <Box 
        key={index} 
        sx={{ 
          width: barPosition === 'full-left' ? '100%' : 'calc(100% - 32px)', 
          height: barPosition === 'full-left' ? '100%' : 'auto',
          mx: barPosition === 'full-left' ? 0 : 'auto',
          my: 2,
          borderRadius: barPosition === 'full-left' ? 0 : '16px',
          overflow: 'hidden',
          boxShadow: barPosition === 'full-left' ? 'none' : theme.shadows[4],
          position: 'relative',
          zIndex: 5 // Verhoog de z-index zodat de slideshow boven de achtergrondkleur overlay wordt weergegeven
        }}
      >
        <Swiper
          ref={swiperRef}
          modules={[EffectFade, EffectCreative, EffectCards, EffectCoverflow, Autoplay]}
          effect={blockSettings?.transition || 'fade'}
          speed={blockSettings?.speed || 1000}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: blockSettings?.interval || 5000,
            disableOnInteraction: false,
            enabled: blockSettings?.autoPlay !== false
          }}
          pagination={false}
          navigation={false}
          onSlideChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
            if (onSlideChange) {
              onSlideChange(swiper.realIndex);
            }
          }}
          style={{
            width: '100%',
            height: barPosition === 'full-left' ? '100%' : '500px'
          }}
        >
          {photos.map((photo) => {
            const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`;
            return (
              <SwiperSlide 
                key={photo.id}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: loadedImages.has(imageUrl) ? 1 : 0,
                    transition: 'opacity 1s ease'
                  }}
                />
                {blockSettings?.show_info && (photo.title || photo.description) && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      bottom: barPosition === 'full-left' ? 32 : 0,
                      left: barPosition === 'full-left' ? 32 : 0,
                      right: barPosition === 'full-left' ? 'auto' : 0,
                      width: barPosition === 'full-left' ? 280 : '100%',
                      p: barPosition === 'full-left' ? 2.5 : 2,
                      borderRadius: barPosition === 'full-left' ? 2 : 0,
                      bgcolor: barPosition === 'full-left'
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(0, 0, 0, 0.85)' 
                          : 'rgba(255, 255, 255, 0.95)'
                        : 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      backdropFilter: barPosition === 'full-left' ? 'blur(10px)' : 'none',
                      border: barPosition === 'full-left' ? '1px solid' : 'none',
                      borderColor: barPosition === 'full-left'
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)'
                        : 'transparent',
                      boxShadow: barPosition === 'full-left'
                        ? theme.palette.mode === 'dark'
                          ? '0 8px 32px rgba(0,0,0,0.5)'
                          : '0 8px 32px rgba(0,0,0,0.25)'
                        : 'none',
                      zIndex: 2
                    }}
                  >
                    {photo.title && (
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: barPosition === 'full-left'
                            ? theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.95)' 
                              : 'rgba(0, 0, 0, 0.95)'
                            : 'white',
                          textShadow: barPosition === 'full-left' ? 'none' : '0 1px 2px rgba(0,0,0,0.6)',
                          fontWeight: 500,
                          fontSize: barPosition === 'full-left' ? '1.1rem' : undefined,
                          mb: barPosition === 'full-left' ? 1 : undefined
                        }}
                      >
                        {photo.title}
                      </Typography>
                    )}
                    {photo.description && (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: barPosition === 'full-left'
                            ? theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.7)' 
                              : 'rgba(0, 0, 0, 0.7)'
                            : 'rgba(255,255,255,0.9)',
                          textShadow: barPosition === 'full-left' ? 'none' : '0 1px 1px rgba(0,0,0,0.4)',
                          mt: barPosition === 'full-left' ? undefined : 0.5,
                          fontSize: barPosition === 'full-left' ? '0.9rem' : undefined,
                          lineHeight: barPosition === 'full-left' ? 1.5 : undefined
                        }}
                      >
                        {photo.description}
                      </Typography>
                    )}
                  </Box>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>
    );
  };

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'spacer':
        return (
          <Box 
            sx={{ 
              height: block.settings?.height || 32,
              width: '100%'
            }}
          />
        );

      case 'text':
        return (
          <Box 
            sx={{ 
              mb: 4,
              maxWidth: '1200px',
              margin: '0 auto',
              '& .ql-align-center': {
                textAlign: 'center'
              },
              '& .ql-align-right': {
                textAlign: 'right'
              },
              '& .ql-align-justify': {
                textAlign: 'justify'
              },
              '& .ql-size-small': {
                fontSize: '0.75em'
              },
              '& .ql-size-large': {
                fontSize: '1.5em'
              },
              '& .ql-size-huge': {
                fontSize: '2em'
              },
              '& p': { 
                fontSize: '1em',
                '&.ql-align-center': {
                  textAlign: 'center'
                },
                '&.ql-align-right': {
                  textAlign: 'right'
                },
                '&.ql-align-justify': {
                  textAlign: 'justify'
                }
              },
              '& h1': { 
                fontSize: '2em', 
                fontWeight: 600,
                fontFamily: settings?.font 
              },
              '& h2': { 
                fontSize: '1.5em', 
                fontWeight: 600,
                fontFamily: settings?.font 
              },
              '& h3': { 
                fontSize: '1.17em', 
                fontWeight: 600,
                fontFamily: settings?.font 
              }
            }}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      
      case 'image':
        const imageContent = Array.isArray(block.content) ? block.content : block.content ? [block.content] : [];
        console.log('Image content:', imageContent);
        return (
          <Box sx={{ 
            mb: 4,
            width: getImageWidth(block.settings?.size),
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {imageContent.map((image) => {
              console.log('Rendering image:', image);
              console.log('showTitle:', image.showTitle);
              console.log('title:', image.title);
              console.log('description:', image.description);
              return (
                <Box
                  key={image.id}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    component="img"
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${image.filename}`}
                    alt={image.title || 'Afbeelding'}
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    sx={{ 
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      boxShadow: image.showShadow ? 3 : 0,
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                  {image.showTitle && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        color: 'white',
                        p: 2,
                        zIndex: 2
                      }}
                    >
                      {image.title && (
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'white',
                            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            fontWeight: 500
                          }}
                        >
                          {image.title}
                        </Typography>
                      )}
                      {image.description && (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            textShadow: '0 1px 1px rgba(0,0,0,0.4)',
                            mt: 0.5
                          }}
                        >
                          {image.description}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        );
      
      case 'slideshow':
        return renderSlideshow(block, index);
      
      case 'contact':
        return (
          <Container maxWidth="md" sx={{ py: 4 }}>
            <ContactForm />
          </Container>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      position: 'relative',
      ...(content.length === 1 && content[0].type === 'slideshow' && {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      })
    }}>
      {content.map((block, index) => renderBlock(block, index))}
    </Box>
  );
};

export default PageContent; 