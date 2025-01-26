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
import { useTheme } from '@mui/material/styles';

const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isNew = !id;
  const theme = useTheme();

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
      const response = await api.get(`/pages/id/${id}`);
      setPage({
        ...response.data,
        description: response.data.description || ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Fout bij laden pagina');
      showToast('Fout bij laden pagina', 'error');
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
    <Box sx={{ 
      height: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      pt: 3
    }}>
      <Box
        sx={{
          height: '64px',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          boxShadow: 1,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          mx: 3
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/paginas')}
        >
          Terug
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </Box>

      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        pt: 3,
        px: 3,
        pb: 3
      }}>
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
      </Box>
    </Box>
  );
};

export default PageEditor; 