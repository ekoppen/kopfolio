import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid
} from '@mui/material';
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

const getImageWidth = (size) => {
  switch (size) {
    case 'small': return '25%';
    case 'medium': return '50%';
    case 'large': return '75%';
    case 'full': return '100%';
    default: return '50%';
  }
};

const PageContent = ({ content = [] }) => {
  const { settings } = useSettings();

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

  const renderBlock = (block) => {
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
        const [activeSlide, setActiveSlide] = useState(0);
        return (
          <Box sx={{ 
            mb: 4,
            width: getImageWidth(block.settings?.size),
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {block.content && block.content.length > 0 && (
              <Box 
                sx={{ 
                  position: 'relative',
                  height: 500,
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: block.settings?.showShadow ? 3 : 0
                }}
              >
                <Swiper
                  modules={[EffectFade, EffectCreative, EffectCards, EffectCoverflow, Autoplay]}
                  effect={block.settings?.transition || 'fade'}
                  speed={1000}
                  slidesPerView={1}
                  loop={true}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    enabled: block.settings?.autoPlay !== false
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
                  {block.content.map((photo) => (
                    <SwiperSlide key={photo.id}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: 1,
                          transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {block.settings?.showTitles && block.content[activeSlide] && (
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
                    {block.content[activeSlide].title && (
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                          fontWeight: 500
                        }}
                      >
                        {block.content[activeSlide].title}
                      </Typography>
                    )}
                    {block.content[activeSlide].description && (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.9)',
                          textShadow: '0 1px 1px rgba(0,0,0,0.4)',
                          mt: 0.5
                        }}
                      >
                        {block.content[activeSlide].description}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box 
      onContextMenu={handleContextMenu}
      sx={{ 
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        fontFamily: settings?.font,
        fontSize: settings?.content_font_size ? `${settings.content_font_size}px` : '16px'
      }}
    >
      {content.map((block) => (
        <Box key={block.id}>
          {renderBlock(block)}
        </Box>
      ))}
    </Box>
  );
};

export default PageContent; 