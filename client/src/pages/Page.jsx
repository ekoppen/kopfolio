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
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(null);
  const isAdmin = true; // TODO: Vervang dit door echte admin check

  useEffect(() => {
    loadPage();
  }, [slug]);

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
    <Box>
      {isEditing && isAdmin && (
        <AppBar 
          position="sticky" 
          color="default" 
          elevation={1}
          sx={{ top: 64 }} // Positie onder de navigatiebalk
        >
          <Toolbar variant="dense">
            <Button
              startIcon={<TextIcon />}
              onClick={() => addBlock('text')}
              sx={{ mr: 1 }}
            >
              Tekst
            </Button>
            <Button
              startIcon={<ImageIcon />}
              onClick={() => addBlock('image')}
              sx={{ mr: 1 }}
            >
              Afbeelding
            </Button>
            <Button
              startIcon={<SlideshowIcon />}
              onClick={() => addBlock('slideshow')}
              sx={{ mr: 1 }}
            >
              Slideshow
            </Button>
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

      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 4,
          mt: 2 // Kleine ruimte na de toolbar
        }}
      >
        {isEditing ? (
          <PageContentEditor
            initialContent={editedContent}
            onChange={setEditedContent}
          />
        ) : (
          <PageContent content={page.content} />
        )}

        {isAdmin && !isEditing && (
          <Fab 
            color="primary" 
            sx={{ position: 'fixed', bottom: 32, right: 32 }}
            onClick={() => setIsEditing(true)}
          >
            <EditIcon />
          </Fab>
        )}
      </Container>
    </Box>
  );
};

export default Page; 