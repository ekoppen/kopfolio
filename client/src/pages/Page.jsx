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

const Page = () => {
  const theme = useTheme();
  const { slug } = useParams();
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
    const loadPageContent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/pages/${slug}`);
        setPage(response.data);

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

    loadPageContent();
  }, [slug]);

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
    return (
      <Box sx={{ 
        position: 'fixed',
        top: barPosition === 'top' ? '64px' : 0,
        left: barPosition === 'full-left' ? '280px' : 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        bgcolor: 'transparent'
      }}>
        <Box sx={{ 
          height: '100%',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: barPosition === 'full-left' ? '32px' : 0,
          zIndex: 1
        }}>
          <Box sx={{
            width: barPosition === 'full-left' ? 'calc(100% - 64px)' : '100%',
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: barPosition === 'full-left' ? '16px' : 0,
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(35, 35, 45, 0.98)'
              : 'rgba(255, 255, 255, 0.95)',
            boxShadow: barPosition === 'full-left' 
              ? theme.palette.mode === 'dark'
                ? '0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.1)'
              : theme.palette.mode === 'dark'
                ? '0 0 0 1px rgba(255, 255, 255, 0.1)'
                : 'none',
            backdropFilter: 'blur(10px)'
          }}>
            <PageContent content={page.content} isFullscreenSlideshow={true} />
          </Box>
        </Box>
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
      bgcolor: 'transparent'
    }}>
      <Box sx={{ 
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: barPosition === 'full-left' ? '32px' : 0,
        zIndex: 1
      }}>
        <Box sx={{
          width: barPosition === 'full-left' ? 'calc(100% - 64px)' : '100%',
          height: '100%',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: barPosition === 'full-left' ? '16px' : 0,
          overflow: 'auto',
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(35, 35, 45, 0.98)'
            : 'rgba(255, 255, 255, 0.95)',
          boxShadow: barPosition === 'full-left' 
            ? theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.1)'
            : theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255, 255, 255, 0.1)'
              : 'none',
          backdropFilter: 'blur(10px)',
          py: 8,
          px: {
            xs: 2,
            sm: 4,
            md: 6
          }
        }}>
          <PageContent content={page.content} />
        </Box>
      </Box>
    </Box>
  );
};

export default Page; 