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
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  Collections as SlideshowIcon
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
    menu_level: 0,
    menu_order: 0,
    is_parent_only: false,
    is_fullscreen_slideshow: false,
    settings: {
      slideshow: null
    }
  });
  const [availableParents, setAvailableParents] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Laad beschikbare parent pagina's
        const pagesResponse = await api.get('/pages');
        const filteredPages = pagesResponse.data.filter(p => p.id !== parseInt(id));
        setAvailableParents(filteredPages);

        // Laad albums voor slideshow selectie
        const albumsResponse = await api.get('/albums');
        setAlbums(albumsResponse.data);

        if (id) {
          const response = await api.get(`/pages/id/${id}`);
          console.log('Loaded page data:', response.data);
          
          // Bepaal is_fullscreen_slideshow op basis van de aanwezigheid van slideshow settings
          const hasSlideshow = Boolean(response.data.settings?.slideshow?.albumId);
          
          const pageData = {
            ...response.data,
            is_fullscreen_slideshow: hasSlideshow,
            settings: {
              ...response.data.settings,
              slideshow: hasSlideshow ? {
                albumId: response.data.settings?.slideshow?.albumId || '',
                transition: response.data.settings?.slideshow?.transition || 'fade',
                speed: response.data.settings?.slideshow?.speed || 1000,
                interval: response.data.settings?.slideshow?.interval || 5000,
                autoPlay: response.data.settings?.slideshow?.autoPlay !== false,
                show_info: response.data.settings?.slideshow?.show_info || false
              } : null
            }
          };
          console.log('Processed page data:', pageData);

          // Als er een album is geselecteerd voor de slideshow, haal dan de foto's op
          if (pageData.settings?.slideshow?.albumId) {
            const photosResponse = await api.get(`/photos/album/${pageData.settings.slideshow.albumId}`);
            setPhotos(photosResponse.data);
            
            // Voeg de foto's toe aan de content array
            pageData.content = [{
              id: 'slideshow',
              type: 'slideshow',
              content: photosResponse.data,
              settings: pageData.settings.slideshow
            }];
          }

          console.log('Final page data:', pageData);
          setPage(pageData);
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
      
      // Initialiseer slideshow settings als fullscreen slideshow wordt ingeschakeld
      if (name === 'is_fullscreen_slideshow') {
        updates.settings = {
          ...prev.settings,
          slideshow: newValue ? {
            albumId: prev.settings?.slideshow?.albumId || '',
            transition: prev.settings?.slideshow?.transition || 'fade',
            speed: prev.settings?.slideshow?.speed || 1000,
            interval: prev.settings?.slideshow?.interval || 5000,
            autoPlay: prev.settings?.slideshow?.autoPlay !== false,
            show_info: prev.settings?.slideshow?.show_info || false
          } : undefined
        };
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
      // Bepaal is_fullscreen_slideshow op basis van de aanwezigheid van slideshow settings
      const isFullscreenSlideshow = Boolean(page.settings?.slideshow?.albumId);
      
      const pageData = {
        ...page,
        menu_order: page.menu_order || 0, // Behoud de bestaande menu_order
        is_fullscreen_slideshow: isFullscreenSlideshow,
        settings: {
          ...page.settings,
          slideshow: isFullscreenSlideshow ? {
            albumId: page.settings?.slideshow?.albumId || '',
            transition: page.settings?.slideshow?.transition || 'fade',
            speed: page.settings?.slideshow?.speed || 1000,
            interval: page.settings?.slideshow?.interval || 5000,
            autoPlay: page.settings?.slideshow?.autoPlay !== false,
            show_info: page.settings?.slideshow?.show_info || false
          } : null
        }
      };

      console.log('Saving page data:', pageData);
      
      let response;
      if (id) {
        response = await api.put(`/pages/${id}`, pageData);
      } else {
        response = await api.post('/pages', pageData);
      }

      // Stuur een event om de slideshow instellingen bij te werken
      window.dispatchEvent(new CustomEvent('slideshowSettingsUpdated'));

      console.log('Server response:', response.data);
      showToast(id ? 'Pagina succesvol bijgewerkt' : 'Pagina succesvol aangemaakt', 'success');
      navigate('/admin/paginas');
    } catch (error) {
      console.error('Fout bij opslaan pagina:', error);
      showToast('Fout bij opslaan pagina', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSlideshowSettingChange = async (setting, value) => {
    setPage(prev => {
      const newSettings = {
        ...prev,
        settings: {
          ...prev.settings,
          slideshow: {
            ...prev.settings?.slideshow,
            [setting]: value
          }
        }
      };

      // Als er een album is geselecteerd, haal dan de foto's op
      if (setting === 'albumId' && value) {
        api.get(`/photos/album/${value}`).then(response => {
          setPhotos(response.data);
          // Voeg de foto's toe aan de content array
          setPage(currentPage => ({
            ...currentPage,
            content: [{
              id: 'slideshow',
              type: 'slideshow',
              content: response.data,
              settings: currentPage.settings?.slideshow
            }]
          }));
        }).catch(error => {
          console.error('Fout bij ophalen album foto\'s:', error);
          showToast('Fout bij ophalen album foto\'s', 'error');
        });
      }

      return newSettings;
    });
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
      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      position: 'relative',
      minHeight: '100vh'
    }}>
      {/* Zwevende knoppen */}
      <Box
        sx={{
          position: 'fixed',
          top: 76,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 1100
        }}
      >
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
      </Box>

      {/* Terug knop */}
      <Box sx={{ px: 3, pt: 3, pb: 0 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/paginas')}
        >
          Terug
        </Button>
      </Box>

      <Box sx={{ 
        height: '100%',
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
            {!['home', 'contact'].includes(page.slug) && (
              <TextField
                fullWidth
                label="Slug"
                name="slug"
                value={page.slug}
                onChange={handleChange}
                required
                disabled={!isNew}
                helperText={isNew ? "URL-vriendelijke naam (alleen kleine letters, cijfers en streepjes)" : "Slug kan niet worden gewijzigd"}
              />
            )}
          </Box>

          {/* Achtergrond instellingen */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Achtergrond Instellingen
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Achtergrondkleur"
                type="color"
                value={page.settings?.background_color || '#ffffff'}
                onChange={(e) => setPage(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    background_color: e.target.value
                  }
                }))}
                sx={{ width: '120px' }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Achtergrondkleur
              </Typography>
              
              <TextField
                label="Transparantie"
                type="number"
                value={page.settings?.background_opacity !== undefined ? page.settings.background_opacity : 1}
                onChange={(e) => setPage(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    background_opacity: parseFloat(e.target.value)
                  }
                }))}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                sx={{ width: '120px', ml: 2 }}
              />
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>Achtergrond Patroon</InputLabel>
              <Select
                value={page.settings?.pattern || ''}
                onChange={(e) => setPage(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    pattern: e.target.value
                  }
                }))}
                label="Achtergrond Patroon"
              >
                <MenuItem value="">
                  <em>Geen patroon</em>
                </MenuItem>
                <MenuItem value="pattern1.png">Patroon 1</MenuItem>
                <MenuItem value="pattern2.png">Patroon 2</MenuItem>
                <MenuItem value="pattern3.png">Patroon 3</MenuItem>
                <MenuItem value="pattern4.png">Patroon 4</MenuItem>
                <MenuItem value="pattern5.png">Patroon 5</MenuItem>
              </Select>
            </FormControl>
            
            {page.settings?.pattern && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Patroon Schaal"
                  type="number"
                  value={page.settings?.pattern_scale || 200}
                  onChange={(e) => setPage(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      pattern_scale: parseInt(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 50, max: 500, step: 10 }}
                  sx={{ width: '120px' }}
                />
                
                <TextField
                  label="Patroon Transparantie"
                  type="number"
                  value={page.settings?.pattern_opacity !== undefined ? page.settings.pattern_opacity : 1}
                  onChange={(e) => setPage(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      pattern_opacity: parseFloat(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  sx={{ width: '120px', ml: 2 }}
                />
              </Box>
            )}
          </Box>
          
          {/* Bestaande menu instellingen */}
          {!['home', 'contact'].includes(page.slug) && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Menu instellingen
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(page.is_in_menu)}
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

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="is_fullscreen_slideshow"
                  checked={Boolean(page.is_fullscreen_slideshow)}
                  onChange={(e) => {
                    const isEnabled = e.target.checked;
                    console.log('Slideshow toggle changed:', isEnabled);
                    setPage(prev => {
                      const newPage = {
                        ...prev,
                        is_fullscreen_slideshow: isEnabled,
                        settings: {
                          ...prev.settings,
                          slideshow: isEnabled ? {
                            albumId: prev.settings?.slideshow?.albumId || '',
                            transition: prev.settings?.slideshow?.transition || 'fade',
                            speed: prev.settings?.slideshow?.speed || 1000,
                            interval: prev.settings?.slideshow?.interval || 5000,
                            autoPlay: prev.settings?.slideshow?.autoPlay !== false,
                            show_info: prev.settings?.slideshow?.show_info || false
                          } : null
                        }
                      };
                      console.log('New page state:', newPage);
                      return newPage;
                    });
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Fullscreen slideshow
                  <Tooltip title="Toon een fullscreen slideshow van foto's uit een album">
                    <IconButton size="small" sx={{ ml: 0.5 }}>
                      <SlideshowIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          </Box>

          {page.is_fullscreen_slideshow && (
            <Box sx={{ ml: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Slideshow instellingen
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={page.settings?.slideshow?.show_info || false}
                        onChange={(e) => handleSlideshowSettingChange('show_info', e.target.checked)}
                      />
                    }
                    label="Toon foto informatie"
                  />
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Overgang effect</InputLabel>
                  <Select
                    value={page.settings?.slideshow?.transition || 'fade'}
                    onChange={(e) => handleSlideshowSettingChange('transition', e.target.value)}
                    label="Overgang effect"
                  >
                    <MenuItem value="fade">Fade</MenuItem>
                    <MenuItem value="slide">Horizontaal Scrollen</MenuItem>
                    <MenuItem value="creative">Creative</MenuItem>
                    <MenuItem value="cards">Cards</MenuItem>
                    <MenuItem value="coverflow">Coverflow</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Album</InputLabel>
                  <Select
                    value={page.settings?.slideshow?.albumId || ''}
                    onChange={(e) => handleSlideshowSettingChange('albumId', e.target.value)}
                    label="Album"
                  >
                    <MenuItem value="">
                      <em>Selecteer een album</em>
                    </MenuItem>
                    {albums.map((album) => (
                      <MenuItem key={album.id} value={album.id}>
                        {album.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Interval (ms)</InputLabel>
                  <TextField
                    type="number"
                    value={page.settings?.slideshow?.interval || 5000}
                    onChange={(e) => handleSlideshowSettingChange('interval', parseInt(e.target.value))}
                    inputProps={{ min: 1000, step: 500 }}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Effect Duur (ms)</InputLabel>
                  <TextField
                    type="number"
                    value={page.settings?.slideshow?.speed || 1000}
                    onChange={(e) => handleSlideshowSettingChange('speed', parseInt(e.target.value))}
                    inputProps={{ min: 100, step: 100 }}
                  />
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(page.settings?.slideshow?.autoPlay)}
                      onChange={(e) => handleSlideshowSettingChange('autoPlay', e.target.checked)}
                    />
                  }
                  label="Automatisch afspelen"
                />
              </Box>
            </Box>
          )}
        </Paper>

        {!page.is_parent_only && !page.is_fullscreen_slideshow && page.slug !== 'home' && (
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

        {/* Slideshow Settings Dialog - alleen voor home pagina */}
        <Dialog 
          open={slideshowDialogOpen} 
          onClose={() => setSlideshowDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Home Slideshow Instellingen</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Transitie Effect</InputLabel>
                <Select
                  value={page.settings?.slideshow?.transition || 'fade'}
                  onChange={(e) => handleSlideshowSettingChange('transition', e.target.value)}
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
                onChange={(e) => handleSlideshowSettingChange('interval', parseInt(e.target.value))}
                inputProps={{ min: 1000, step: 500 }}
                helperText="Tijd tussen elke slide (in milliseconden)"
              />

              <TextField
                fullWidth
                type="number"
                label="Effect Duur (ms)"
                value={page.settings?.slideshow?.speed || 1000}
                onChange={(e) => handleSlideshowSettingChange('speed', parseInt(e.target.value))}
                inputProps={{ min: 100, step: 100 }}
                helperText="Duur van het transitie effect (in milliseconden)"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(page.settings?.slideshow?.autoPlay)}
                    onChange={(e) => handleSlideshowSettingChange('autoPlay', e.target.checked)}
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