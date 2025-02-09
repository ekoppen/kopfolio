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
  Switch,
  InputAdornment
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
                Site Titel en Footer
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Footer Tekst"
                    value={settings.footer_text}
                    onChange={(e) => handleChange('footer_text', e.target.value)}
                    helperText="Bijvoorbeeld: © 2024 Jouw Naam"
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
                  <Box sx={{ 
                    width: '200px',
                    height: '100px',
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 3,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
                  }}>
                    {/* Transparantie patroon */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `
                        linear-gradient(45deg, 
                        ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 25%, 
                        transparent 25%, 
                        transparent 75%, 
                        ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 75%, 
                        ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}),
                        linear-gradient(45deg, 
                        ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 25%, 
                        transparent 25%, 
                        transparent 75%, 
                        ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 75%, 
                        ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                      )`,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 8px 8px',
                      zIndex: 1
                    }} />

                    {/* Logo preview */}
                    {settings.logo && (
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
                        alt="Logo preview"
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          display: 'block',
                          margin: 'auto'
                        }}
                      />
                    )}
                  </Box>

                  {/* Upload knop */}
                  <Box sx={{ mb: 3 }}>
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

                  {/* Logo Instellingen */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Logo Grootte (px)"
                        value={settings.logo_size || 60}
                        onChange={(e) => handleChange('logo_size', e.target.value)}
                        InputProps={{ inputProps: { min: 20, max: 400 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Marge Boven (px)"
                        value={settings.logo_margin_top || 0}
                        onChange={(e) => handleChange('logo_margin_top', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Marge Links (px)"
                        value={settings.logo_margin_left || 0}
                        onChange={(e) => handleChange('logo_margin_left', e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  {/* Logo Dropshadow */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Logo Dropshadow
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.logo_shadow_enabled || false}
                              onChange={(e) => handleChange('logo_shadow_enabled', e.target.checked)}
                            />
                          }
                          label="Dropshadow inschakelen"
                        />
                      </Grid>
                      {settings.logo_shadow_enabled && (
                        <>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="X Offset"
                              value={settings.logo_shadow_x || 0}
                              onChange={(e) => handleChange('logo_shadow_x', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Y Offset"
                              value={settings.logo_shadow_y || 0}
                              onChange={(e) => handleChange('logo_shadow_y', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Blur"
                              value={settings.logo_shadow_blur || 0}
                              onChange={(e) => handleChange('logo_shadow_blur', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Transparantie"
                              value={settings.logo_shadow_opacity || 0.2}
                              onChange={(e) => handleChange('logo_shadow_opacity', e.target.value)}
                              inputProps={{ step: 0.1, min: 0, max: 1 }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="color"
                              label="Schaduw Kleur"
                              value={settings.logo_shadow_color || '#000000'}
                              onChange={(e) => handleChange('logo_shadow_color', e.target.value)}
                              sx={{
                                '& input': {
                                  height: 40,
                                  cursor: 'pointer'
                                }
                              }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Subtitel Instellingen */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Subtitel
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subtitel"
                        value={settings.site_subtitle || ''}
                        onChange={(e) => handleChange('site_subtitle', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FontPicker
                        value={settings.subtitle_font || 'system-ui'}
                        onChange={(value) => handleChange('subtitle_font', value)}
                        label="Subtitel Lettertype"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Lettergrootte (px)"
                        value={settings.subtitle_size || 14}
                        onChange={(e) => handleChange('subtitle_size', e.target.value)}
                        InputProps={{ inputProps: { min: 8, max: 72 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Marge Boven (px)"
                        value={settings.subtitle_margin_top || 0}
                        onChange={(e) => handleChange('subtitle_margin_top', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Marge Links (px)"
                        value={settings.subtitle_margin_left || 0}
                        onChange={(e) => handleChange('subtitle_margin_left', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="color"
                        label="Tekstkleur"
                        value={settings.subtitle_color || '#000000'}
                        onChange={(e) => handleChange('subtitle_color', e.target.value)}
                        sx={{
                          '& input': {
                            height: 40,
                            cursor: 'pointer'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Subtitel Dropshadow */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Subtitel Dropshadow
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.subtitle_shadow_enabled || false}
                              onChange={(e) => handleChange('subtitle_shadow_enabled', e.target.checked)}
                            />
                          }
                          label="Dropshadow inschakelen"
                        />
                      </Grid>
                      {settings.subtitle_shadow_enabled && (
                        <>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="X Offset"
                              value={settings.subtitle_shadow_x || 0}
                              onChange={(e) => handleChange('subtitle_shadow_x', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Y Offset"
                              value={settings.subtitle_shadow_y || 0}
                              onChange={(e) => handleChange('subtitle_shadow_y', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Blur"
                              value={settings.subtitle_shadow_blur || 0}
                              onChange={(e) => handleChange('subtitle_shadow_blur', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Transparantie"
                              value={settings.subtitle_shadow_opacity || 0.2}
                              onChange={(e) => handleChange('subtitle_shadow_opacity', e.target.value)}
                              inputProps={{ step: 0.1, min: 0, max: 1 }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="color"
                              label="Schaduw Kleur"
                              value={settings.subtitle_shadow_color || '#000000'}
                              onChange={(e) => handleChange('subtitle_shadow_color', e.target.value)}
                              sx={{
                                '& input': {
                                  height: 40,
                                  cursor: 'pointer'
                                }
                              }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
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

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Footer
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FontPicker
                value={settings.footer_font || 'system-ui'}
                onChange={(value) => handleChange('footer_font', value)}
                label="Footer lettertype"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Footer tekstgrootte"
                value={settings.footer_size || 14}
                onChange={(e) => handleChange('footer_size', e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">px</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="color"
                label="Footer tekstkleur"
                value={settings.footer_color || '#666666'}
                onChange={(e) => handleChange('footer_color', e.target.value)}
                sx={{
                  '& input': {
                    height: 40,
                    cursor: 'pointer'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Settings; 