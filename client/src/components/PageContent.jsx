import React from 'react';
import {
  Box,
  Typography,
  Grid
} from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const getSliderSettings = (settings = {}) => ({
  dots: true,
  infinite: true,
  speed: settings.speed === 'slow' ? 1000 : settings.speed === 'fast' ? 300 : 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: settings.autoPlay !== false,
  autoplaySpeed: settings.interval || 5000,
  fade: settings.transition === 'fade',
  cssEase: 'ease-out',
  slide: settings.transition !== 'fade',
  beforeChange: (current, next) => {
    // Stuur een custom event met de huidige slide en totaal aantal slides
    window.dispatchEvent(new CustomEvent('slideshowProgress', {
      detail: {
        currentSlide: next,
        totalSlides: block.content.length
      }
    }));
  }
});

const PageContent = ({ content = [] }) => {
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
      case 'text':
        return (
          <Box 
            sx={{ mb: 4 }}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      
      case 'image':
        const imageContent = Array.isArray(block.content) ? block.content : block.content ? [block.content] : [];
        const columns = imageContent.length === 1 ? 12 : 
                       imageContent.length === 2 ? 6 :
                       imageContent.length === 3 ? 4 : 
                       imageContent.length === 4 ? 3 : 6;
        
        return (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {imageContent.map((image) => (
                <Grid item xs={12} sm={columns} key={image.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Box
                      component="img"
                      src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${image.filename}`}
                      alt={image.title || 'Afbeelding'}
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      sx={{ 
                        width: '100%',
                        aspectRatio: '4/3',
                        objectFit: 'cover',
                        borderRadius: 1,
                        boxShadow: image.showShadow ? 3 : 0,
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'none'
                      }}
                    />
                    {image.showTitle && image.title && (
                      <Box 
                        sx={{ 
                          mt: 1.5,
                          textAlign: 'center',
                          width: '100%'
                        }}
                      >
                        <Typography variant="subtitle1" color="text.primary">
                          {image.title}
                        </Typography>
                        {image.description && (
                          <Typography variant="body2" color="text.secondary">
                            {image.description}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      
      case 'slideshow':
        return (
          <Box sx={{ mb: 4 }}>
            {block.content && block.content.length > 0 && (
              <Box 
                sx={{ 
                  position: 'relative',
                  height: 500,
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: 3,
                  '& .slick-slider': {
                    height: '100%',
                  },
                  '& .slick-list, & .slick-track': {
                    height: '100%',
                  },
                  '& .slick-slide > div': {
                    height: '100%',
                  },
                  '& .slick-dots': {
                    bottom: 16,
                    '& li button:before': {
                      color: 'white',
                      opacity: 0.5,
                    },
                    '& li.slick-active button:before': {
                      opacity: 1,
                    },
                  },
                  ...(block.settings?.transition === 'slide' && {
                    '& .slick-slide': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.5s ease-out',
                    },
                    '& .slick-active': {
                      transform: 'scale(1)',
                    },
                  }),
                  ...(block.settings?.transition === 'zoom' && {
                    '& .slick-slide': {
                      transform: 'scale(1.2)',
                      transition: 'transform 6s ease-out',
                    },
                    '& .slick-active': {
                      transform: 'scale(1)',
                    },
                  }),
                }}
              >
                <Slider {...getSliderSettings(block.settings)}>
                  {block.content.map((photo, photoIndex) => (
                    <Box
                      key={photo.id}
                      sx={{
                        position: 'relative',
                        height: '100%',
                      }}
                    >
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`}
                        alt={photo.title || `Foto ${photoIndex + 1}`}
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        sx={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          pointerEvents: 'none',
                        }}
                      />
                      {block.settings?.showTitles && photo.title && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            color: 'white',
                            p: 2
                          }}
                        >
                          <Typography variant="h6">
                            {photo.title}
                          </Typography>
                          {photo.description && (
                            <Typography variant="body1" sx={{ opacity: 0.8 }}>
                              {photo.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Slider>
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
        userSelect: 'none'
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