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
  Divider,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  const [slideshowDialogOpen, setSlideshowDialogOpen] = useState(false);
  const [page, setPage] = useState({
    title: '',
    slug: '',
    description: '',
    content: [],
    is_in_menu: false,
    parent_id: null,
    is_parent_only: false,
    settings: {
      slideshow: {
        interval: 5000,
        transition: 'fade',
        autoPlay: true
      }
    }
  });
  const [availableParents, setAvailableParents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Laad beschikbare parent pagina's
        const pagesResponse = await api.get('/pages');
        // Filter de huidige pagina uit de lijst van mogelijke parents
        const filteredPages = id ? 
          pagesResponse.data.filter(p => p.id !== parseInt(id)) : 
          pagesResponse.data;
        setAvailableParents(filteredPages);

        if (id) {
          const response = await api.get(`/pages/id/${id}`);
          setPage(response.data);
        }
      } catch (error) {
        console.error('Fout bij laden pagina:', error);
        showToast('Fout bij laden pagina', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Functie om een titel om te zetten naar een slug
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Verwijder diacritische tekens
      .replace(/[^a-z0-9\s-]/g, '') // Verwijder speciale karakters
      .replace(/\s+/g, '-') // Vervang spaties door streepjes
      .replace(/-+/g, '-') // Vervang meerdere streepjes door één streepje
      .trim(); // Verwijder spaties aan begin en eind
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setPage(prev => {
      const updates = { [name]: newValue };
      
      // Update de slug automatisch als de titel verandert
      if (name === 'title') {
        updates.slug = generateSlug(value);
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleContentChange = (newContent) => {
    setPage(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (id) {
        await api.put(`/pages/${id}`, page);
        showToast('Pagina succesvol bijgewerkt', 'success');
      } else {
        await api.post('/pages', page);
        showToast('Pagina succesvol aangemaakt', 'success');
      }
      navigate('/admin/paginas');
    } catch (error) {
      console.error('Fout bij opslaan pagina:', error);
      showToast('Fout bij opslaan pagina', 'error');
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
      overflow: 'hidden'
    }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/paginas')}
          >
            Terug
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => navigate('/admin/paginas')}
            sx={{ mr: 1 }}
          >
            Annuleren
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </Toolbar>
      </AppBar>

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
          {page.slug === 'home' && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setSlideshowDialogOpen(true)}
              >
                Slideshow Instellingen
              </Button>
            </Box>
          )}
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
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 3 }} />
          
          {page.slug !== 'home' && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Menu instellingen
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={page.is_in_menu}
                      onChange={(e) => setPage(prev => ({ 
                        ...prev, 
                        is_in_menu: e.target.checked,
                        parent_id: e.target.checked ? prev.parent_id : null
                      }))}
                      name="is_in_menu"
                    />
                  }
                  label="Toon in menu"
                />

                {page.is_in_menu && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>Parent Pagina</InputLabel>
                      <Select
                        value={page.parent_id || ''}
                        onChange={(e) => setPage(prev => ({
                          ...prev,
                          parent_id: e.target.value || null,
                          is_parent_only: false // Reset parent-only als het een subpagina wordt
                        }))}
                        label="Parent Pagina"
                      >
                        <MenuItem value="">
                          <em>Geen parent (top-level)</em>
                        </MenuItem>
                        {availableParents
                          .filter(p => p.is_in_menu && p.is_parent_only)
                          .map((parent) => (
                            <MenuItem key={parent.id} value={parent.id}>
                              {parent.title}
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {page.is_in_menu && !page.parent_id && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(page.is_parent_only)}
                            onChange={(e) => setPage(prev => ({ 
                              ...prev, 
                              is_parent_only: e.target.checked,
                              content: e.target.checked ? [] : prev.content
                            }))}
                            name="is_parent_only"
                          />
                        }
                        label="Alleen als parent gebruiken (niet klikbaar in menu)"
                      />
                    )}
                  </>
                )}
              </Box>
            </>
          )}
        </Paper>

        {!page.is_parent_only && !page.slug === 'home' && (
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inhoud
            </Typography>
            <PageContentEditor
              initialContent={page.content}
              onChange={handleContentChange}
            />
          </Paper>
        )}

        {/* Slideshow Settings Dialog */}
        <Dialog 
          open={slideshowDialogOpen} 
          onClose={() => setSlideshowDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Slideshow Instellingen</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Transitie Effect</InputLabel>
                <Select
                  value={page.settings?.slideshow?.transition || 'fade'}
                  onChange={(e) => setPage(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      slideshow: {
                        ...prev.settings?.slideshow,
                        transition: e.target.value
                      }
                    }
                  }))}
                  label="Transitie Effect"
                >
                  <MenuItem value="fade">Fade</MenuItem>
                  <MenuItem value="slide">Horizontaal Scrollen</MenuItem>
                  <MenuItem value="creative">Creative</MenuItem>
                  <MenuItem value="cards">Cards</MenuItem>
                  <MenuItem value="coverflow">Coverflow</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Interval (ms)"
                value={page.settings?.slideshow?.interval || 5000}
                onChange={(e) => setPage(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    slideshow: {
                      ...prev.settings?.slideshow,
                      interval: parseInt(e.target.value)
                    }
                  }
                }))}
                inputProps={{ min: 1000, step: 500 }}
                helperText="Tijd tussen elke slide (in milliseconden)"
              />

              <TextField
                fullWidth
                type="number"
                label="Effect Duur (ms)"
                value={page.settings?.slideshow?.speed || 1000}
                onChange={(e) => setPage(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    slideshow: {
                      ...prev.settings?.slideshow,
                      speed: parseInt(e.target.value)
                    }
                  }
                }))}
                inputProps={{ min: 100, step: 100 }}
                helperText="Duur van het transitie effect (in milliseconden)"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={page.settings?.slideshow?.autoPlay !== false}
                    onChange={(e) => setPage(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        slideshow: {
                          ...prev.settings?.slideshow,
                          autoPlay: e.target.checked
                        }
                      }
                    }))}
                  />
                }
                label="Automatisch afspelen"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSlideshowDialogOpen(false)}>Sluiten</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PageEditor; 