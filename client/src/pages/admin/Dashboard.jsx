import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Collections as AlbumIcon,
  PhotoLibrary as PhotoIcon,
  Article as PageIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalAlbums: 0,
    totalPages: 0
  });
  
  // Initiële state met lege strings en defaults
  const [settings, setSettings] = useState({
    siteTitle: '',
    accentColor: '#2196f3',
    font: 'Inter',
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);

  const loadStats = async () => {
    try {
      const [photos, albums, pages] = await Promise.all([
        api.get('/photos'),
        api.get('/albums'),
        api.get('/pages')
      ]);
      setStats({
        totalPhotos: photos.data.length,
        totalAlbums: albums.data.length,
        totalPages: pages.data.length
      });
    } catch (error) {
      showToast('Fout bij ophalen statistieken', 'error');
    }
  };

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      // Zorg ervoor dat we altijd geldige waardes hebben
      setSettings({
        siteTitle: response.data.site_title || '',
        accentColor: response.data.accent_color || '#2196f3',
        font: response.data.font || 'Inter',
        logo: response.data.logo || null
      });
      if (response.data.logo) {
        setLogoPreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${response.data.logo}`);
      }
    } catch (error) {
      showToast('Fout bij ophalen instellingen', 'error');
    }
  };

  useEffect(() => {
    loadStats();
    loadSettings();
  }, []);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSettings(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const formData = new FormData();
      formData.append('site_title', settings.siteTitle);
      formData.append('accent_color', settings.accentColor);
      formData.append('font', settings.font);
      if (settings.logo instanceof File) {
        formData.append('logo', settings.logo);
      }
      
      await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Instellingen succesvol opgeslagen', 'success');
    } catch (error) {
      showToast('Fout bij opslaan instellingen', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Linker kolom met statistieken */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
            Statistieken
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ bgcolor: 'primary.50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhotoIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 500, color: 'primary.main' }}>
                        {stats.totalPhotos}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Foto's
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ bgcolor: 'success.50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AlbumIcon sx={{ color: 'success.main', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 500, color: 'success.main' }}>
                        {stats.totalAlbums}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Albums
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ bgcolor: 'info.50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PageIcon sx={{ color: 'info.main', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 500, color: 'info.main' }}>
                        {stats.totalPages}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pagina's
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Rechter kolom met site branding */}
        <Paper 
          elevation={0}
          sx={{ 
            width: 400,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Site Branding
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Logo
            </Typography>
            <Box 
              sx={{ 
                width: '100%',
                height: 120,
                bgcolor: 'grey.100',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                backgroundImage: logoPreview ? `url(${logoPreview})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {!logoPreview && (
                <Tooltip title="Upload logo">
                  <IconButton
                    component="label"
                    sx={{ 
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <UploadIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {logoPreview && (
              <Button
                component="label"
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
              >
                Logo wijzigen
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Button>
            )}
          </Box>

          <TextField
            label="Site titel"
            value={settings.siteTitle}
            onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
            fullWidth
          />

          <TextField
            label="Accent kleur"
            type="color"
            value={settings.accentColor}
            onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
            fullWidth
            sx={{ 
              '& input': { 
                height: 40,
                width: '100%',
                cursor: 'pointer'
              }
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Font</InputLabel>
            <Select
              value={settings.font}
              label="Font"
              onChange={(e) => setSettings(prev => ({ ...prev, font: e.target.value }))}
            >
              <MenuItem value="Inter">Inter</MenuItem>
              <MenuItem value="Roboto">Roboto</MenuItem>
              <MenuItem value="Open Sans">Open Sans</MenuItem>
              <MenuItem value="Montserrat">Montserrat</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained"
            onClick={handleSaveSettings}
            sx={{ alignSelf: 'flex-end' }}
          >
            Opslaan
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 