import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import api from '../utils/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom styling voor de slideshow
const sliderStyles = `
  .slick-slider, .slick-list, .slick-track {
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .slick-slide {
    width: 100vw !important;
  }
  .slick-slide > div {
    height: 100vh !important;
    width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .slick-slider {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .slick-list {
    overflow: hidden !important;
  }
  .slick-track {
    display: flex !important;
  }
`;

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [pageSettings, setPageSettings] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

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
          setPhotos(photosResponse.data);
        }
      } catch (error) {
        console.error('Fout bij ophalen home content:', error);
      }
    };

    loadHomeContent();
  }, []);

  // Start de voortgangsbalk wanneer een nieuwe slide begint
  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const duration = pageSettings?.interval || 5000;
    const startTime = Date.now();
    
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval.current);
      }
    }, 16); // ~60fps
  };

  // Cleanup interval bij unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: pageSettings?.speed === 'slow' ? 1000 : pageSettings?.speed === 'fast' ? 300 : 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: pageSettings?.autoPlay !== false,
    autoplaySpeed: pageSettings?.interval || 5000,
    fade: pageSettings?.transition === 'fade',
    cssEase: pageSettings?.transition === 'slide' ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'ease-out',
    slide: true,
    arrows: false,
    pauseOnHover: false,
    lazyLoad: true,
    swipe: true,
    draggable: true,
    beforeChange: () => {
      // Reset en start de voortgangsbalk
      setProgress(0);
      startProgress();
    }
  };

  return (
    <>
      <style>{sliderStyles}</style>
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        m: '0 !important',
        p: '0 !important',
        '& .slick-slide': {
          ...(pageSettings?.transition === 'slide' && {
            opacity: 0.5,
            transition: 'opacity 0.5s ease-out',
          }),
          ...(pageSettings?.transition === 'zoom' && {
            transform: 'scale(1.2)',
            transition: 'transform 6s ease-out',
          }),
        },
        '& .slick-active': {
          opacity: '1 !important',
          transform: pageSettings?.transition === 'zoom' ? 'scale(1) !important' : 'none',
        },
      }}>
        {photos.length > 0 && (
          <Slider {...settings}>
            {photos.map((photo) => (
              <Box 
                key={photo.id}
                sx={{
                  height: '100vh !important',
                  width: '100vw !important',
                  backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  m: '0 !important',
                  p: '0 !important'
                }}
              />
            ))}
          </Slider>
        )}
      </Box>
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: `${progress}%`,
          height: '32px',
          background: 'rgba(255,255,255,0.1)',
          transition: 'width 16ms linear',
          zIndex: 1299
        }} 
      />
    </>
  );
}

export default Home; 