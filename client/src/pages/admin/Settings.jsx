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
  useTheme,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import PatternPicker from '../../components/PatternPicker';
import FontPicker from '../../components/FontPicker';
import { useSettings } from '../../contexts/SettingsContext';

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 64;

const Settings = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { settings, updateSettings, updateSettingsLocally } = useSettings();
  const [patterns, setPatterns] = useState([]);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen] = useState(() => {
    const savedState = localStorage.getItem('adminDrawerOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    loadSettings();
    loadPatterns();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      updateSettings(response.data);
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
    setSaving(true);
    console.log('Opslaan van instellingen:', settings);
    try {
      const success = await updateSettings(settings);
      if (success) {
        showToast('Instellingen opgeslagen', 'success');
        console.log('Instellingen succesvol opgeslagen');
        
        // Dispatch een event voor pattern updates
        window.dispatchEvent(new CustomEvent('patternSettingsUpdated', {
          detail: {
            sidebar_pattern: settings.sidebar_pattern,
            pattern_opacity: settings.pattern_opacity,
            pattern_scale: settings.pattern_scale,
            pattern_color: settings.pattern_color
          }
        }));
      } else {
        console.error('Fout bij opslaan instellingen: geen success');
        showToast('Fout bij opslaan instellingen', 'error');
      }
    } catch (error) {
      console.error('Fout bij opslaan instellingen:', error);
      showToast('Fout bij opslaan instellingen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    console.log('Veld gewijzigd:', field, 'nieuwe waarde:', value);
    updateSettingsLocally({ [field]: value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        position: 'fixed',
        top: 76, // Iets lager dan de admin header voor wat ruimte
        right: 24,
        zIndex: 1100,
      }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            boxShadow: theme.palette.mode === 'dark'
              ? '0 2px 12px rgba(0,0,0,0.5)'
              : '0 2px 12px rgba(0,0,0,0.1)'
          }}
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </Box>

      {/* Voeg padding toe om ruimte te maken voor de fixed header */}
      <Box sx={{ pt: 7 }}>
        <Grid container spacing={3}>
          {/* Site Titel */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 2px 12px rgba(0,0,0,0.5)' 
                  : '0 2px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Site Titel
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Site Titel"
                    value={settings.site_title}
                    onChange={(e) => handleChange('site_title', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Typografie en Branding */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 2px 12px rgba(0,0,0,0.5)' 
                  : '0 2px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Typografie en Branding
              </Typography>
              <Grid container spacing={3}>
                {/* Logo Upload */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Logo
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {settings.logo && (
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
                        alt="Logo"
                        sx={{
                          width: 'auto',
                          height: 60,
                          objectFit: 'contain',
                          borderRadius: 1
                        }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                      >
                        {settings.logo ? 'Logo Wijzigen' : 'Logo Uploaden'}
                      </Button>
                    </label>
                  </Box>
                </Grid>

                {/* Logo Instellingen */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Logo Grootte (px)"
                    value={settings.logo_size || 200}
                    onChange={(e) => handleChange('logo_size', e.target.value)}
                    inputProps={{ min: 50, max: 400 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Logo Marge Boven (px)"
                    value={settings.logo_margin_top}
                    onChange={(e) => handleChange('logo_margin_top', e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Logo Marge Links (px)"
                    value={settings.logo_margin_left}
                    onChange={(e) => handleChange('logo_margin_left', e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>

                {/* Basis Lettertype Instellingen */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Basis Lettertype
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FontPicker
                    value={settings.font}
                    onChange={(value) => handleChange('font', value)}
                    label="Lettertype"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Menu Lettergrootte (px)"
                    value={settings.menu_font_size || 16}
                    onChange={(e) => handleChange('menu_font_size', e.target.value)}
                    inputProps={{ min: 12, max: 24 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Pagina Lettergrootte (px)"
                    value={settings.content_font_size || 16}
                    onChange={(e) => handleChange('content_font_size', e.target.value)}
                    inputProps={{ min: 12, max: 24 }}
                  />
                </Grid>

                {/* Subtitel Instellingen */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Subtitel Instellingen
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Site Subtitel"
                    value={settings.site_subtitle}
                    onChange={(e) => handleChange('site_subtitle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FontPicker
                    value={settings.subtitle_font}
                    onChange={(value) => handleChange('subtitle_font', value)}
                    label="Subtitel Lettertype"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Subtitel Lettergrootte (px)"
                    value={settings.subtitle_size || 14}
                    onChange={(e) => handleChange('subtitle_size', e.target.value)}
                    inputProps={{ min: 10, max: 32 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Subtitel Marge Boven (px)"
                    value={settings.subtitle_margin_top}
                    onChange={(e) => handleChange('subtitle_margin_top', e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Subtitel Marge Links (px)"
                    value={settings.subtitle_margin_left}
                    onChange={(e) => handleChange('subtitle_margin_left', e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="color"
                    label="Subtitel Kleur"
                    value={settings.subtitle_color || '#000000'}
                    onChange={(e) => handleChange('subtitle_color', e.target.value)}
                    sx={{
                      maxWidth: 200,
                      '& input': {
                        height: 40,
                        cursor: 'pointer',
                        padding: '8px 8px'
                      }
                    }}
                  />
                </Grid>

                {/* Subtitel Dropshadow */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.subtitle_shadow_enabled}
                          onChange={(e) => handleChange('subtitle_shadow_enabled', e.target.checked)}
                        />
                      }
                      label="Subtitel Schaduw"
                    />
                    {settings.subtitle_shadow_enabled && (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                          type="number"
                          label="X Offset"
                          value={settings.subtitle_shadow_x || 0}
                          onChange={(e) => handleChange('subtitle_shadow_x', e.target.value)}
                          sx={{ width: 100 }}
                          inputProps={{ min: -20, max: 20 }}
                        />
                        <TextField
                          type="number"
                          label="Y Offset"
                          value={settings.subtitle_shadow_y || 0}
                          onChange={(e) => handleChange('subtitle_shadow_y', e.target.value)}
                          sx={{ width: 100 }}
                          inputProps={{ min: -20, max: 20 }}
                        />
                        <TextField
                          type="number"
                          label="Blur"
                          value={settings.subtitle_shadow_blur || 0}
                          onChange={(e) => handleChange('subtitle_shadow_blur', e.target.value)}
                          sx={{ width: 100 }}
                          inputProps={{ min: 0, max: 20 }}
                        />
                        <TextField
                          type="color"
                          label="Schaduw Kleur"
                          value={settings.subtitle_shadow_color || '#000000'}
                          onChange={(e) => handleChange('subtitle_shadow_color', e.target.value)}
                          sx={{ 
                            width: 100,
                            '& input': {
                              height: 40,
                              cursor: 'pointer',
                              padding: '8px 8px'
                            }
                          }}
                        />
                        <TextField
                          type="number"
                          label="Opacity"
                          value={settings.subtitle_shadow_opacity || 0.2}
                          onChange={(e) => handleChange('subtitle_shadow_opacity', e.target.value)}
                          sx={{ width: 100 }}
                          inputProps={{ min: 0, max: 1, step: 0.1 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Kleurinstellingen */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Kleurinstellingen
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="color"
                    label="Accent Kleur"
                    value={settings.accent_color || '#000000'}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    sx={{
                      maxWidth: 200,
                      '& input': {
                        height: 40,
                        cursor: 'pointer',
                        padding: '8px 8px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Achtergrond Patroon */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 2px 12px rgba(0,0,0,0.5)' 
                  : '0 2px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Achtergrond Patroon
              </Typography>
              <PatternPicker
                patterns={patterns}
                selectedPattern={settings.sidebar_pattern || 'none'}
                patternOpacity={settings.pattern_opacity}
                patternScale={settings.pattern_scale}
                patternColor={settings.pattern_color}
                onPatternChange={(value) => handleChange('sidebar_pattern', value)}
                onOpacityChange={(value) => handleChange('pattern_opacity', value)}
                onScaleChange={(value) => handleChange('pattern_scale', value)}
                onColorChange={(value) => handleChange('pattern_color', value)}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Settings; 