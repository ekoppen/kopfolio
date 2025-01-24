import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Container
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageContentEditor from './PageContentEditor';
import api from '../utils/api';

const PageEditor = ({ page = null, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (page) {
      console.log('Initiële pagina data:', page);
      setFormData({
        title: page.title || '',
        content: Array.isArray(page.content) ? page.content : 
          typeof page.content === 'string' ? 
            [{ id: Date.now(), type: 'text', content: page.content }] : 
            []
      });
    }
  }, [page]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleContentChange = (newContent) => {
    console.log('Content gewijzigd:', newContent);
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Vul alle verplichte velden in');
      return;
    }

    console.log('Versturen van formulier data:', formData);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (page) {
        console.log('Update pagina met ID:', page.id);
        const response = await api.put(`/pages/${page.id}`, formData);
        console.log('Server response:', response.data);
        setSuccess('Pagina succesvol bijgewerkt');
      } else {
        console.log('Nieuwe pagina aanmaken');
        const response = await api.post('/pages', formData);
        console.log('Server response:', response.data);
        setSuccess('Pagina succesvol aangemaakt');
        setFormData({ title: '', content: [] });
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Fout bij opslaan:', error.response || error);
      setError(error.response?.data?.message || 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={() => navigate('/admin/paginas')}
            sx={{ mr: 2 }}
          >
            <CloseIcon />
          </IconButton>
          <TextField
            label="Titel"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            size="small"
            sx={{ 
              flexGrow: 1,
              maxWidth: 400,
              mr: 2,
              bgcolor: 'background.paper',
              borderRadius: 1
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : page ? (
              'Pagina Bijwerken'
            ) : (
              'Pagina Aanmaken'
            )}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Alerts */}
      {(error || success) && (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
        </Container>
      )}

      {/* Content Editor */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 4,
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <PageContentEditor
          initialContent={formData.content}
          onChange={handleContentChange}
        />
      </Container>
    </Box>
  );
};

export default PageEditor; 