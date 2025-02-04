import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import PatternPicker from '../../components/PatternPicker';
import FontPicker from '../../components/FontPicker';

const Settings = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    site_title: '',
    site_subtitle: '',
    subtitle_font: 'Roboto',
    subtitle_size: 14,
    subtitle_color: '#FFFFFF',
    accent_color: '#000000',
    font: 'Roboto',
    logo: null,
    logo_margin_top: 0,
    logo_margin_left: 0,
    subtitle_margin_top: 0,
    subtitle_margin_left: 0,
    logo_size: 48,
    footer_text: '',
    sidebar_pattern: 'none',
    pattern_opacity: 0.15,
    pattern_scale: 1,
    pattern_color: '#FCF4FF'
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    loadSettings();
    loadPatterns();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
      if (response.data.logo) {
        setLogoPreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${response.data.logo}`);
      }
    } catch (error) {
      console.error('Fout bij ophalen instellingen:', error);
      showToast('Fout bij ophalen instellingen', 'error');
    }
  };

  const loadPatterns = async () => {
    try {
      const response = await api.get('/settings/patterns');
      setPatterns([
        { name: 'Geen patroon', value: 'none', preview: null },
        ...response.data
      ]);
    } catch (error) {
      console.error('Fout bij ophalen patronen:', error);
      showToast('Fout bij ophalen patronen', 'error');
    }
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setLoading(true);
      const response = await api.post('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLogoPreview(URL.createObjectURL(file));
      showToast('Logo succesvol geüpload', 'success');
    } catch (error) {
      console.error('Fout bij uploaden logo:', error);
      showToast('Fout bij uploaden logo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      showToast('Instellingen opgeslagen', 'success');
      
      // Dispatch een event voor pattern updates
      window.dispatchEvent(new CustomEvent('patternSettingsUpdated', {
        detail: {
          sidebar_pattern: settings.sidebar_pattern,
          pattern_opacity: settings.pattern_opacity,
          pattern_scale: settings.pattern_scale,
          pattern_color: settings.pattern_color
        }
      }));
      
    } catch (error) {
      console.error('Fout bij opslaan instellingen:', error);
      showToast('Fout bij opslaan instellingen', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        Instellingen
      </Typography>

      <Grid container spacing={3}>
        {/* Site Titel & Subtitel */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              Site Titel & Subtitel
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site titel"
                  value={settings.site_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FontPicker
                  label="Titel lettertype"
                  value={settings.font}
                  onChange={(value) => setSettings(prev => ({ ...prev, font: value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subtitel"
                  value={settings.site_subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_subtitle: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FontPicker
                  label="Subtitel lettertype"
                  value={settings.subtitle_font}
                  onChange={(value) => setSettings(prev => ({ ...prev, subtitle_font: value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Subtitel grootte"
                  value={settings.subtitle_size}
                  onChange={(e) => setSettings(prev => ({ ...prev, subtitle_size: e.target.value }))}
                  inputProps={{ min: 8, max: 72 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="color"
                  label="Subtitel kleur"
                  value={settings.subtitle_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, subtitle_color: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Subtitel marge boven"
                  value={settings.subtitle_margin_top}
                  onChange={(e) => setSettings(prev => ({ ...prev, subtitle_margin_top: e.target.value }))}
                  inputProps={{ min: -50, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Subtitel marge links"
                  value={settings.subtitle_margin_left}
                  onChange={(e) => setSettings(prev => ({ ...prev, subtitle_margin_left: e.target.value }))}
                  inputProps={{ min: -50, max: 100 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Logo & Branding */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              Logo & Branding
            </Typography>

            <Box sx={{ mb: 3 }}>
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
                      disabled={loading}
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
              {logoPreview && (
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  disabled={loading}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Logo grootte (px)"
                  value={settings.logo_size}
                  onChange={(e) => setSettings(prev => ({ ...prev, logo_size: parseInt(e.target.value) }))}
                  InputProps={{
                    inputProps: { min: 20, max: 200 }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Kleuren & Lettertypen */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              Kleuren & Lettertypen
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Accent kleur"
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                  sx={{
                    '& input': {
                      height: 40,
                      padding: 1,
                      width: '100%'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Lettertype</InputLabel>
                  <Select
                    value={settings.font}
                    label="Lettertype"
                    onChange={(e) => setSettings(prev => ({ ...prev, font: e.target.value }))}
                  >
                    <MenuItem value="Inter">Inter</MenuItem>
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Open Sans">Open Sans</MenuItem>
                    <MenuItem value="Montserrat">Montserrat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Footer */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              Footer
            </Typography>

            <TextField
              fullWidth
              label="Footer tekst"
              value={settings.footer_text}
              onChange={(e) => setSettings(prev => ({ ...prev, footer_text: e.target.value }))}
              multiline
              rows={4}
              placeholder="© 2024 Jouw Site Naam"
            />
          </Paper>
        </Grid>

        {/* Achtergrond Patroon */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              Achtergrond Patroon
            </Typography>

            <PatternPicker
              patterns={patterns}
              selectedPattern={settings.sidebar_pattern}
              patternOpacity={settings.pattern_opacity}
              patternScale={settings.pattern_scale}
              patternColor={settings.pattern_color}
              onPatternChange={(value) => setSettings(prev => ({ ...prev, sidebar_pattern: value }))}
              onOpacityChange={(value) => setSettings(prev => ({ ...prev, pattern_opacity: value }))}
              onScaleChange={(value) => setSettings(prev => ({ ...prev, pattern_scale: value }))}
              onColorChange={(value) => setSettings(prev => ({ ...prev, pattern_color: value }))}
            />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          Opslaan
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 