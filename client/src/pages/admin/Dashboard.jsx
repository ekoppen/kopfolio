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
  Upload as UploadIcon,
  Download as DownloadIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalAlbums: 0,
    totalPages: 0
  });
  
  // Initiële state met lege strings en defaults
  const [settings, setSettings] = useState({
    site_title: '',
    site_subtitle: '',
    subtitle_font: 'Roboto',
    subtitle_size: 14,
    subtitle_color: '#FFFFFF',
    accent_color: '#000000',
    font: 'Roboto',
    logo: null,
    logo_position: 'left',
    logo_margin_top: 0,
    logo_margin_left: 0,
    subtitle_margin_top: 0,
    subtitle_margin_left: 0,
    footer_text: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const navigate = useNavigate();

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
      setSettings({
        site_title: response.data.site_title || '',
        site_subtitle: response.data.site_subtitle || '',
        subtitle_font: response.data.subtitle_font || 'Roboto',
        subtitle_size: response.data.subtitle_size || 14,
        subtitle_color: response.data.subtitle_color || '#FFFFFF',
        accent_color: response.data.accent_color || '#000000',
        font: response.data.font || 'Roboto',
        logo: response.data.logo || null,
        logo_position: response.data.logo_position || 'left',
        logo_margin_top: response.data.logo_margin_top || 0,
        logo_margin_left: response.data.logo_margin_left || 0,
        subtitle_margin_top: response.data.subtitle_margin_top || 0,
        subtitle_margin_left: response.data.subtitle_margin_left || 0,
        footer_text: response.data.footer_text || ''
      });
      if (response.data.logo) {
        setLogoPreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${response.data.logo}`);
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
      formData.append('site_title', settings.site_title);
      formData.append('site_subtitle', settings.site_subtitle);
      formData.append('subtitle_font', settings.subtitle_font);
      formData.append('subtitle_size', settings.subtitle_size);
      formData.append('subtitle_color', settings.subtitle_color);
      formData.append('accent_color', settings.accent_color);
      formData.append('font', settings.font);
      formData.append('logo_position', settings.logo_position);
      formData.append('logo_margin_top', settings.logo_margin_top);
      formData.append('logo_margin_left', settings.logo_margin_left);
      formData.append('subtitle_margin_top', settings.subtitle_margin_top);
      formData.append('subtitle_margin_left', settings.subtitle_margin_left);
      formData.append('footer_text', settings.footer_text);
      if (settings.logo instanceof File) {
        formData.append('logo', settings.logo);
      }
      
      await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update document font
      document.documentElement.style.setProperty('font-family', `${settings.font}, sans-serif`);
      
      // Trigger een window event om de App component te informeren
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: { 
          accent_color: settings.accent_color,
          font: settings.font,
          logo_position: settings.logo_position,
          site_subtitle: settings.site_subtitle,
          site_title: settings.site_title,
          subtitle_font: settings.subtitle_font,
          subtitle_size: settings.subtitle_size,
          subtitle_color: settings.subtitle_color,
          logo_margin_top: settings.logo_margin_top,
          logo_margin_left: settings.logo_margin_left,
          subtitle_margin_top: settings.subtitle_margin_top,
          subtitle_margin_left: settings.subtitle_margin_left,
          footer_text: settings.footer_text
        }
      }));

      showToast('success', 'Instellingen succesvol opgeslagen');
    } catch (error) {
      showToast('error', 'Fout bij opslaan instellingen');
    }
  };

  const handleCreateBackup = async () => {
    try {
      const response = await api.get('/backup/export', {
        responseType: 'blob'
      });
      
      // Creëer een download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `kopfolio_backup_${date}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('success', 'Backup succesvol gedownload');
    } catch (error) {
      showToast('error', 'Fout bij maken van backup');
    }
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('backup', file);

      await api.post('/backup/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast('success', 'Backup succesvol geïmporteerd');
      // Herlaad alle data
      loadStats();
      loadSettings();
    } catch (error) {
      showToast('error', 'Fout bij importeren van backup');
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
              <Card 
                elevation={0} 
                onClick={() => navigate('/admin/fotos')}
                sx={{ 
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                  }
                }}
              >
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
              <Card 
                elevation={0} 
                onClick={() => navigate('/admin/albums')}
                sx={{ 
                  bgcolor: 'success.50',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                  }
                }}
              >
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
              <Card 
                elevation={0}
                onClick={() => navigate('/admin/paginas')}
                sx={{ 
                  bgcolor: 'info.50',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                  }
                }}
              >
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

          <Typography variant="h5" sx={{ mt: 4, mb: 3, fontWeight: 500 }}>
            Beheer
          </Typography>

          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Backup maken
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Download een volledige backup van je site, inclusief alle instellingen, database, branding en uploads.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<BackupIcon />}
                    onClick={handleCreateBackup}
                    sx={{ borderRadius: 2 }}
                  >
                    Backup maken
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Backup importeren
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Herstel je site vanaf een eerder gemaakte backup. Let op: dit overschrijft alle huidige gegevens.
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<RestoreIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Backup importeren
                    <input
                      type="file"
                      hidden
                      accept=".zip"
                      onChange={handleImportBackup}
                    />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Rechter kolom met site branding */}
        <Paper 
          elevation={0}
          sx={{ 
            width: 400,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
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
                bgcolor: 'transparent',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                backgroundImage: logoPreview ? `url(${logoPreview})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: '1px dashed',
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'
              }}
            >
              {!logoPreview && (
                <Tooltip title="Upload logo">
                  <IconButton
                    component="label"
                    sx={{ 
                      bgcolor: 'transparent',
                      '&:hover': { bgcolor: 'action.hover' }
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
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {logoPreview && (
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
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
              <FormControl size="small">
                <Select
                  value={settings.logo_position}
                  onChange={(e) => setSettings(prev => ({ ...prev, logo_position: e.target.value }))}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="left">Links</MenuItem>
                  <MenuItem value="center">Midden</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Marge boven (px)"
                  value={settings.logo_margin_top}
                  onChange={(e) => setSettings(prev => ({ ...prev, logo_margin_top: parseInt(e.target.value) }))}
                  InputProps={{
                    inputProps: { min: -50, max: 100 }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Marge links (px)"
                  value={settings.logo_margin_left}
                  onChange={(e) => setSettings(prev => ({ ...prev, logo_margin_left: parseInt(e.target.value) }))}
                  InputProps={{
                    inputProps: { min: -50, max: 100 }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>Branding</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Footer tekst"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                placeholder="© 2024 Jouw Site Naam"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Site titel"
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subtitel"
                value={settings.site_subtitle}
                onChange={(e) => setSettings({ ...settings, site_subtitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Subtitel lettertype</InputLabel>
                <Select
                  value={settings.subtitle_font}
                  onChange={(e) => setSettings({ ...settings, subtitle_font: e.target.value })}
                  label="Subtitel lettertype"
                >
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Playfair Display">Playfair Display</MenuItem>
                  <MenuItem value="Montserrat">Montserrat</MenuItem>
                  <MenuItem value="Open Sans">Open Sans</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Subtitel grootte"
                value={settings.subtitle_size}
                onChange={(e) => setSettings({ ...settings, subtitle_size: parseInt(e.target.value) })}
                InputProps={{
                  inputProps: { min: 12, max: 48 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Subtitel kleur"
                type="color"
                value={settings.subtitle_color}
                onChange={(e) => setSettings({ ...settings, subtitle_color: e.target.value })}
                sx={{
                  '& input': {
                    height: 40,
                    padding: 1,
                    width: '100%'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Subtitel marge boven (px)"
                value={settings.subtitle_margin_top}
                onChange={(e) => setSettings(prev => ({ ...prev, subtitle_margin_top: parseInt(e.target.value) }))}
                InputProps={{
                  inputProps: { min: -50, max: 100 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Subtitel marge links (px)"
                value={settings.subtitle_margin_left}
                onChange={(e) => setSettings(prev => ({ ...prev, subtitle_margin_left: parseInt(e.target.value) }))}
                InputProps={{
                  inputProps: { min: -50, max: 100 }
                }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Accent kleur"
            type="color"
            value={settings.accent_color}
            onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
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