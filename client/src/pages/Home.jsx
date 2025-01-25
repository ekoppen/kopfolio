import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import api from '../utils/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom styling voor de slideshow
const sliderStyles = `
  .slick-slider, .slick-list, .slick-track {
    height: 100vh;
    margin: 0;
    padding: 0;
  }
  .slick-slide > div {
    height: 100vh;
    margin: 0;
    padding: 0;
  }
  .slick-slider {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0 !important;
    padding: 0 !important;
  }
`;

const Home = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadHomePhotos = async () => {
      try {
        // Haal eerst alle albums op
        const albumsResponse = await api.get('/albums');
        const homeAlbum = albumsResponse.data.find(album => album.is_home);
        
        if (homeAlbum) {
          // Haal de foto's van het home album op met het juiste endpoint
          const photosResponse = await api.get(`/photos/album/${homeAlbum.id}`);
          setPhotos(photosResponse.data);
        }
      } catch (error) {
        console.error('Fout bij ophalen home foto\'s:', error);
      }
    };

    loadHomePhotos();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
    pauseOnHover: false,
    lazyLoad: true
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
        p: '0 !important'
      }}>
        {photos.length > 0 && (
          <Slider {...settings}>
            {photos.map((photo) => (
              <Box 
                key={photo.id}
                sx={{
                  height: '100vh',
                  width: '100vw',
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
    </>
  );
};

export default Home; 