import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Help as HelpIcon,
  Collections as SlideshowIcon
} from '@mui/icons-material';
import api from '../utils/api';

const PageEditor = ({ open, onClose, onSave, page }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [isParentOnly, setIsParentOnly] = useState(false);
  const [isFullscreenSlideshow, setIsFullscreenSlideshow] = useState(false);
  const [settings, setSettings] = useState({});
  const [pages, setPages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (page) {
      setTitle(page.title || '');
      setSlug(page.slug || '');
      setParentId(page.parent_id || '');
      setIsParentOnly(page.is_parent_only || false);
      setIsFullscreenSlideshow(page.is_fullscreen_slideshow || false);
      setSettings(page.settings || {});
    } else {
      setTitle('');
      setSlug('');
      setParentId('');
      setIsParentOnly(false);
      setIsFullscreenSlideshow(false);
      setSettings({});
    }
  }, [page]);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const response = await api.get('/pages');
        setPages(response.data);
      } catch (error) {
        console.error('Fout bij ophalen pagina\'s:', error);
        setError('Fout bij ophalen pagina\'s');
      }
    };

    const loadAlbums = async () => {
      try {
        const response = await api.get('/photos/albums');
        setAlbums(response.data);
      } catch (error) {
        console.error('Fout bij ophalen albums:', error);
        setError('Fout bij ophalen albums');
      }
    };

    loadPages();
    loadAlbums();
  }, []);

  const handleSave = () => {
    const pageData = {
      title,
      slug,
      parent_id: parentId || null,
      is_parent_only: isParentOnly,
      is_fullscreen_slideshow: isFullscreenSlideshow,
      settings: {
        ...settings,
        slideshow: isFullscreenSlideshow ? {
          ...settings.slideshow,
          albumId: settings.slideshow?.albumId || null,
          transition: settings.slideshow?.transition || 'fade',
          speed: settings.slideshow?.speed || 1000,
          interval: settings.slideshow?.interval || 5000,
          autoPlay: settings.slideshow?.autoPlay !== false
        } : undefined
      }
    };
    onSave(pageData);
  };

  const handleAlbumChange = (albumId) => {
    setSettings(prev => ({
      ...prev,
      slideshow: {
        ...(prev.slideshow || {}),
        albumId
      }
    }));
  };

  const handleTransitionChange = (transition) => {
    setSettings(prev => ({
      ...prev,
      slideshow: {
        ...(prev.slideshow || {}),
        transition
      }
    }));
  };

  const handleSpeedChange = (speed) => {
    const value = parseInt(speed, 10);
    if (!isNaN(value) && value >= 0) {
      setSettings(prev => ({
        ...prev,
        slideshow: {
          ...(prev.slideshow || {}),
          speed: value
        }
      }));
    }
  };

  const handleIntervalChange = (interval) => {
    const value = parseInt(interval, 10);
    if (!isNaN(value) && value >= 0) {
      setSettings(prev => ({
        ...prev,
        slideshow: {
          ...(prev.slideshow || {}),
          interval: value
        }
      }));
    }
  };

  const handleAutoPlayChange = (autoPlay) => {
    setSettings(prev => ({
      ...prev,
      slideshow: {
        ...(prev.slideshow || {}),
        autoPlay
      }
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 24, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
        }
      }}
    >
      <DialogTitle>
        {page ? 'Pagina bewerken' : 'Nieuwe pagina'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Titel"
          type="text"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          label="Slug"
          type="text"
          fullWidth
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Hoofdpagina</InputLabel>
          <Select
            value={parentId}
            label="Hoofdpagina"
            onChange={(e) => setParentId(e.target.value)}
          >
            <MenuItem value="">
              <em>Geen</em>
            </MenuItem>
            {pages
              .filter(p => p.id !== page?.id)
              .map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isParentOnly}
                onChange={(e) => setIsParentOnly(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Alleen hoofdpagina
                <Tooltip title="Deze pagina dient alleen als hoofdpagina voor subpagina's en is zelf niet klikbaar">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isFullscreenSlideshow}
                onChange={(e) => setIsFullscreenSlideshow(e.target.checked)}
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

        {isFullscreenSlideshow && (
          <Box sx={{ ml: 4 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Album</InputLabel>
              <Select
                value={settings.slideshow?.albumId || ''}
                label="Album"
                onChange={(e) => handleAlbumChange(e.target.value)}
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
              <InputLabel>Transitie effect</InputLabel>
              <Select
                value={settings.slideshow?.transition || 'fade'}
                label="Transitie effect"
                onChange={(e) => handleTransitionChange(e.target.value)}
              >
                <MenuItem value="fade">Fade</MenuItem>
                <MenuItem value="creative">Creative</MenuItem>
                <MenuItem value="cards">Cards</MenuItem>
                <MenuItem value="coverflow">Coverflow</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              label="Transitie snelheid (ms)"
              type="number"
              fullWidth
              value={settings.slideshow?.speed || 1000}
              onChange={(e) => handleSpeedChange(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Interval tussen slides (ms)"
              type="number"
              fullWidth
              value={settings.slideshow?.interval || 5000}
              onChange={(e) => handleIntervalChange(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.slideshow?.autoPlay !== false}
                  onChange={(e) => handleAutoPlayChange(e.target.checked)}
                />
              }
              label="Automatisch afspelen"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuleren</Button>
        <Button onClick={handleSave} variant="contained">
          Opslaan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PageEditor; 