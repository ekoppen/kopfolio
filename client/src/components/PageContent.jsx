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
  Autoplay,
  Pagination,
  Navigation
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
      console.log('Fullscreen slideshow detected, photos:', externalPhotos);
      const photos = externalPhotos || content.find(block => block.type === 'slideshow')?.content || [];
      console.log('Photos to display:', photos);
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

    // Als er geen foto's zijn, toon dan niets
    if (!photos.length && !externalPhotos?.length) {
      return null;
    }

    // Gebruik externe foto's als die beschikbaar zijn, anders gebruik de opgehaalde foto's
    const displayPhotos = externalPhotos || photos;

    // Bepaal de hoogte van de slideshow
    const slideshowHeight = isFullscreenSlideshow 
      ? '100vh' 
      : blockSettings?.height 
        ? `${blockSettings.height}px` 
        : '500px';

    return (
      <Box 
        sx={{ 
          height: slideshowHeight,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: isFullscreenSlideshow ? 0 : 2,
          boxShadow: isFullscreenSlideshow 
            ? 'none' 
            : theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.15)',
          mb: isFullscreenSlideshow ? 0 : 4
        }}
      >
        <Swiper
          modules={[EffectFade, Autoplay, Pagination, Navigation]}
          effect={blockSettings?.transition === 'fade' ? 'fade' : 'slide'}
          speed={blockSettings?.speed || 1000}
          autoplay={blockSettings?.autoplay ? {
            delay: (blockSettings?.delay || 5) * 1000,
            disableOnInteraction: false
          } : false}
          pagination={blockSettings?.pagination ? {
            clickable: true,
            dynamicBullets: true
          } : false}
          navigation={blockSettings?.navigation}
          loop={blockSettings?.loop}
          slidesPerView={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (onSlideChange) {
              onSlideChange(0);
            }
          }}
          onSlideChange={(swiper) => {
            if (onSlideChange) {
              onSlideChange(swiper.activeIndex);
            }
          }}
          style={{ 
            width: '100%', 
            height: '100%' 
          }}
        >
          {displayPhotos.map((photo, photoIndex) => {
            const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`;
            
            return (
              <SwiperSlide 
                key={photo.id || `photo-${photoIndex}`}
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
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 500,
                lineHeight: 1.2,
                marginBottom: '0.5em',
                marginTop: '0.5em'
              },
              '& h1': { fontSize: '2em' },
              '& h2': { fontSize: '1.5em' },
              '& h3': { fontSize: '1.17em' },
              '& h4': { fontSize: '1em' },
              '& h5': { fontSize: '0.83em' },
              '& h6': { fontSize: '0.67em' },
              '& a': {
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              },
              '& ul, & ol': {
                paddingLeft: '2em',
                marginBottom: '1em'
              },
              '& li': {
                marginBottom: '0.5em'
              },
              '& blockquote': {
                borderLeft: `4px solid ${theme.palette.divider}`,
                paddingLeft: '1em',
                margin: '1em 0',
                color: theme.palette.text.secondary
              },
              '& pre': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                padding: '1em',
                borderRadius: '4px',
                overflowX: 'auto',
                fontSize: '0.9em'
              },
              '& code': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                padding: '0.2em 0.4em',
                borderRadius: '3px',
                fontSize: '0.9em'
              }
            }}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      
      case 'image':
        const imageContent = Array.isArray(block.content) ? block.content : block.content ? [block.content] : [];
        return (
          <Box sx={{ mb: 4 }}>
            {imageContent.map((image) => (
              <Box
                key={image.id}
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: getAspectRatioPadding(block.settings?.aspectRatio),
                  overflow: 'hidden',
                  borderRadius: 2,
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0,0,0,0.4)'
                    : '0 4px 20px rgba(0,0,0,0.15)',
                  mb: 2
                }}
              >
                <Box
                  component="img"
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${image.filename}`}
                  alt={image.title || 'Afbeelding'}
                  onContextMenu={handleContextMenu}
                  onDragStart={handleDragStart}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
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
                      p: 2,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      color: 'white'
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
            ))}
          </Box>
        );
      
      case 'slideshow':
        return renderSlideshow(block, index);
      
      case 'contact':
        return (
          <ContactForm />
        );
      
      default:
        return null;
    }
  };

  // Als het een fullscreen slideshow is, toon dan de slideshow
  if (isFullscreenSlideshow) {
    console.log('Rendering fullscreen slideshow');
    console.log('External photos:', externalPhotos);
    console.log('Content:', content);
    
    // Gebruik externe foto's als die beschikbaar zijn, anders zoek in de content
    let photos = [];
    if (externalPhotos && externalPhotos.length > 0) {
      photos = externalPhotos;
      console.log('Using external photos:', photos);
    } else {
      // Zoek naar slideshow blok in de content
      const slideshowBlock = content.find(block => block.type === 'slideshow');
      if (slideshowBlock && slideshowBlock.content) {
        photos = Array.isArray(slideshowBlock.content) ? slideshowBlock.content : [slideshowBlock.content];
        console.log('Using photos from slideshow block:', photos);
      }
    }
    
    const slideshowSettings = content.find(block => block.type === 'slideshow')?.settings || {};
    console.log('Slideshow settings:', slideshowSettings);
    
    // Als er geen foto's zijn, toon dan een melding
    if (!photos || photos.length === 0) {
      console.log('No photos found for fullscreen slideshow');
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: 'black'
        }}>
          <Typography variant="h5" color="white">
            Geen foto's gevonden voor deze slideshow
          </Typography>
        </Box>
      );
    }

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
          modules={[EffectFade, Autoplay, Pagination, Navigation]}
          effect={slideshowSettings?.transition === 'fade' ? 'fade' : 'slide'}
          speed={slideshowSettings?.speed || 1000}
          autoplay={slideshowSettings?.autoplay !== false ? {
            delay: (slideshowSettings?.delay || 5) * 1000,
            disableOnInteraction: false
          } : false}
          pagination={slideshowSettings?.pagination ? {
            clickable: true,
            dynamicBullets: true
          } : false}
          navigation={slideshowSettings?.navigation}
          loop={slideshowSettings?.loop !== false}
          slidesPerView={1}
          onSlideChange={(swiper) => {
            setActiveSlide(swiper.activeIndex);
            if (onSlideChange) {
              onSlideChange(swiper.activeIndex);
            }
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {photos.map((photo, photoIndex) => {
            const imageUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`;
            return (
              <SwiperSlide 
                key={photo.id || `photo-${photoIndex}`}
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
                {slideshowSettings?.show_info && (photo.title || photo.description) && (
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
  }

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
      {content.map((block, index) => (
        <Box key={block.id || `block-${index}`}>
          {renderBlock(block, index)}
        </Box>
      ))}
    </Box>
  );
};

export default PageContent; 