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
  const isAdmin = true; // TODO: Vervang dit door echte admin check
  const [barPosition, setBarPosition] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition || 'top';
  });

  useEffect(() => {
    loadPage();
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

  const loadPage = async () => {
    try {
      const response = await api.get(`/pages/${slug}`);
      setPage(response.data);
      setEditedContent(response.data.content);
    } catch (error) {
      console.error('Fout bij ophalen pagina:', error);
      setError(error.response?.data?.message || 'Fout bij ophalen pagina');
    } finally {
      setLoading(false);
    }
  };

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

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: type === 'text' ? '' : type === 'image' ? null : []
    };
    setEditedContent(prev => [...prev, newBlock]);
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
      {isEditing && isAdmin && (
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={1}
          sx={{ 
            top: 0,
            left: barPosition === 'full-left' ? '280px' : 0,
            width: barPosition === 'full-left' ? 'calc(100% - 280px)' : '100%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1600,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 24, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
          }}
        >
          <Toolbar variant="dense">
            <Box sx={{ flexGrow: 1 }} />
            <Button
              startIcon={<CloseIcon />}
              onClick={handleCancel}
              sx={{ mr: 1 }}
            >
              Annuleren
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Opslaan
            </Button>
          </Toolbar>
        </AppBar>
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
        zIndex: 1
      }}>
        <Box sx={{
          width: barPosition === 'full-left' ? 'calc(100% - 64px)' : '100%',
          height: '100%',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: barPosition === 'full-left' ? '16px' : 0,
          overflow: 'auto',
          boxShadow: barPosition === 'full-left' 
            ? theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.25)'
            : 'none',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 24, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 2,
          pt: isEditing ? 8 : 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Box sx={{
            width: '100%',
            maxWidth: '1400px',
            px: { xs: 2, sm: 4 },
            pt: { xs: 6, sm: 8 },
            pb: 4,
            flex: 1
          }}>
            {isEditing ? (
              <PageContentEditor
                initialContent={editedContent}
                onChange={setEditedContent}
              />
            ) : (
              <PageContent content={page.content} />
            )}
          </Box>

          {isAdmin && !isEditing && page.slug !== 'home' && (
            <Fab 
              color="primary" 
              sx={{ position: 'fixed', bottom: 32, right: 32 }}
              onClick={() => setIsEditing(true)}
            >
              <EditIcon />
            </Fab>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Page; 