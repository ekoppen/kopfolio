import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  AppBar,
  Toolbar,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import PageContentEditor from '../../components/PageContentEditor';

const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState({
    title: '',
    slug: '',
    description: '',
    content: []
  });

  useEffect(() => {
    if (!isNew) {
      loadPage();
    }
  }, [id]);

  const loadPage = async () => {
    try {
      const response = await api.get(`/pages/${id}`);
      setPage(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Fout bij laden pagina');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (newContent) => {
    setPage(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleSave = async () => {
    if (!page.title) {
      showToast('Vul een titel in', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await api.post('/pages', page);
        showToast('Pagina succesvol aangemaakt');
      } else {
        await api.put(`/pages/${id}`, page);
        showToast('Pagina succesvol opgeslagen');
      }
      navigate('/admin/paginas');
    } catch (error) {
      showToast(error.response?.data?.message || 'Fout bij opslaan pagina', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1}
        sx={{ top: 64 }}
      >
        <Toolbar variant="dense">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/paginas')}
            sx={{ mr: 2 }}
          >
            Terug
          </Button>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {isNew ? 'Nieuwe pagina' : 'Pagina bewerken'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pagina informatie
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Titel"
              name="title"
              value={page.title}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="URL slug"
              name="slug"
              value={page.slug}
              onChange={handleChange}
              required
              helperText="Bijvoorbeeld: over-ons"
            />
          </Box>
          <TextField
            fullWidth
            label="Beschrijving"
            name="description"
            value={page.description}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Paper>

        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Inhoud
          </Typography>
          <PageContentEditor
            initialContent={page.content}
            onChange={handleContentChange}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default PageEditor; 