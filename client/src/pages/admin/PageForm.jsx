import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch
} from '@mui/material';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const PageForm = ({ page, onSubmitSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    is_published: true
  });
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        description: page.description || '',
        content: page.content || '',
        is_published: page.is_published ?? true
      });
    }
  }, [page]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_published' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (page) {
        await api.put(`/pages/${page.id}`, formData);
        showToast('Pagina succesvol bijgewerkt', 'success');
      } else {
        await api.post('/pages', formData);
        showToast('Pagina succesvol aangemaakt', 'success');
      }
      onSubmitSuccess();
    } catch (error) {
      console.error('Error saving page:', error);
      showToast(
        error.response?.data?.message || 'Fout bij opslaan pagina', 
        'error'
      );
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
          <TextField
            name="title"
            label="Titel"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          />

          <TextField
            name="slug"
            label="URL Slug"
            value={formData.slug}
            onChange={handleChange}
            fullWidth
            required
            disabled={page?.is_home}
            helperText={page?.is_home ? "De URL van de home pagina kan niet worden aangepast" : ""}
            sx={{ mb: 3 }}
          />

          <TextField
            name="description"
            label="Beschrijving"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />

          <TextField
            name="content"
            label="Inhoud"
            value={formData.content}
            onChange={handleChange}
            fullWidth
            multiline
            rows={10}
            sx={{ mb: 3 }}
          />

          <FormControlLabel
            control={
              <Switch
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
              />
            }
            label="Gepubliceerd"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              Annuleren
            </Button>
            <Button type="submit" variant="contained">
              Opslaan
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PageForm; 