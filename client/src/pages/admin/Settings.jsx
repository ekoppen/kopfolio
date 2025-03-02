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
  InputAdornment,
  Tabs,
  Tab,
  Container
} from '@mui/material';
import {
  Upload as UploadIcon,
  TextFields as TextFieldsIcon,
  Palette as PaletteIcon,
  Image as ImageIcon,
  FormatSize as FormatSizeIcon,
  FontDownload as FontDownloadIcon,
  People as PeopleIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import PatternPicker from '../../components/PatternPicker';
import FontPicker from '../../components/FontPicker';
import FontUploader from '../../components/FontUploader';
import { useSettings } from '../../contexts/SettingsContext';
import UserManagement from '../../components/UserManagement';
import EmailSettings from '../../components/EmailSettings';

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 64;

// TabPanel component voor de tab inhoud
const TabPanel = ({ children, value, index, ...other }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
    sx={{ pt: 3 }}
  >
    {value === index && children}
  </Box>
);

const Settings = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const { settings, updateSettings, updateSettingsLocally } = useSettings();
  const [patterns, setPatterns] = useState([]);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [useDynamicBackgroundColor, setUseDynamicBackgroundColor] = useState(
    settings?.use_dynamic_background_color || false
  );

  useEffect(() => {
    loadSettings();
    loadPatterns();
    if (settings) {
      setUseDynamicBackgroundColor(settings.use_dynamic_background_color || false);
    }
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
      const updatedSettings = {
        ...settings,
        use_dynamic_background_color: useDynamicBackgroundColor
      };
      
      console.log('Bijgewerkte instellingen voor opslaan:', updatedSettings);
      
      const success = await updateSettings(updatedSettings);
      if (success) {
        showToast('Instellingen opgeslagen', 'success');
        console.log('Instellingen succesvol opgeslagen');
        
        // Dispatch een event voor pattern updates
        window.dispatchEvent(new CustomEvent('patternSettingsUpdated', {
          detail: {
            sidebar_pattern: updatedSettings.sidebar_pattern,
            pattern_opacity: updatedSettings.pattern_opacity,
            pattern_scale: updatedSettings.pattern_scale,
            pattern_color: updatedSettings.pattern_color
          }
        }));
        
        // Herlaad de instellingen om zeker te zijn dat we de meest recente hebben
        loadSettings();
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
    // Zorg ervoor dat numerieke waarden correct worden verwerkt
    if (field === 'background_opacity' || field === 'pattern_opacity' || field === 'pattern_scale' || 
        field === 'logo_shadow_opacity') {
      value = parseFloat(value);
      if (isNaN(value)) {
        value = field === 'pattern_scale' ? 1 : 0.5;
      }
      
      // Log de waarde voor debugging
      console.log(`Verwerking van ${field}:`, value);
    } else if (field === 'menu_font_size' || field === 'content_font_size' || field === 'footer_size') {
      value = parseInt(value, 10);
      if (isNaN(value) || value < 8) value = 8;
      if (value > 72) value = 72;
    }
    
    // Update de lokale instellingen
    const updatedSettings = { ...settings, [field]: value };
    updateSettingsLocally(updatedSettings);
    
    // Log de bijgewerkte instellingen
    console.log('Bijgewerkte instellingen na handleChange:', updatedSettings);
    
    // Dispatch een event voor pattern updates als het een patrooninstelling is
    if (field === 'sidebar_pattern' || field === 'pattern_opacity' || field === 'pattern_scale' || field === 'pattern_color') {
      window.dispatchEvent(new CustomEvent('patternSettingsUpdated', {
        detail: {
          sidebar_pattern: updatedSettings.sidebar_pattern,
          pattern_opacity: updatedSettings.pattern_opacity,
          pattern_scale: updatedSettings.pattern_scale,
          pattern_color: updatedSettings.pattern_color
        }
      }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Instellingen
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Algemene Instellingen
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="color"
              label="Accent Kleur"
              value={settings.accent_color || '#000000'}
              onChange={(e) => handleChange('accent_color', e.target.value)}
              sx={{
                '& .MuiInputBase-root': { height: 56 },
                '& input': { 
                  cursor: 'pointer',
                  height: '100%'
                }
              }}
              helperText="De hoofdkleur van de website (knoppen, links, etc.)"
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Subtitel</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subtitel"
                  value={settings.site_subtitle || ''}
                  onChange={(e) => handleChange('site_subtitle', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FontPicker
                  value={settings.subtitle_font || 'system-ui'}
                  onChange={(value) => handleChange('subtitle_font', value)}
                  label="Subtitel Lettertype"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="color"
                  label="Tekstkleur"
                  value={settings.subtitle_color || '#000000'}
                  onChange={(e) => handleChange('subtitle_color', e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': { height: 56 },
                    '& input': { 
                      cursor: 'pointer',
                      height: '100%'
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Subtitel Schaduw</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.subtitle_shadow_enabled || false}
                    onChange={(e) => handleChange('subtitle_shadow_enabled', e.target.checked)}
                  />
                }
                label="Schaduw inschakelen"
              />
              {settings.subtitle_shadow_enabled && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="X Offset"
                      value={settings.subtitle_shadow_x || 0}
                      onChange={(e) => handleChange('subtitle_shadow_x', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Y Offset"
                      value={settings.subtitle_shadow_y || 0}
                      onChange={(e) => handleChange('subtitle_shadow_y', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Blur"
                      value={settings.subtitle_shadow_blur || 0}
                      onChange={(e) => handleChange('subtitle_shadow_blur', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Spread"
                      value={settings.subtitle_shadow_spread || 0}
                      onChange={(e) => handleChange('subtitle_shadow_spread', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
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
                        '& .MuiInputBase-root': { height: 56 },
                        '& input': { 
                          cursor: 'pointer',
                          height: '100%'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* Verwijder de dynamische achtergrondkleur instelling van hier */}
          </Grid>
        </Grid>
      </Paper>

      {/* Opslaan knop */}
      <Box sx={{ 
        position: 'fixed',
        top: 76,
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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', pt: 7, mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<TextFieldsIcon />} label="Algemeen" />
          <Tab icon={<ImageIcon />} label="Logo" />
          <Tab icon={<PaletteIcon />} label="Achtergrond" />
          <Tab icon={<FormatSizeIcon />} label="Typografie" />
          <Tab icon={<PeopleIcon />} label="Gebruikers" />
          <Tab icon={<EmailIcon />} label="E-mail" />
        </Tabs>
      </Box>

      {/* Algemene Instellingen */}
      <TabPanel value={activeTab} index={0}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Subtitel</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subtitel"
                    value={settings.site_subtitle || ''}
                    onChange={(e) => handleChange('site_subtitle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FontPicker
                    value={settings.subtitle_font || 'system-ui'}
                    onChange={(value) => handleChange('subtitle_font', value)}
                    label="Subtitel Lettertype"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="color"
                    label="Tekstkleur"
                    value={settings.subtitle_color || '#000000'}
                    onChange={(e) => handleChange('subtitle_color', e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': { height: 56 },
                      '& input': { 
                        cursor: 'pointer',
                        height: '100%'
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Subtitel Schaduw</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.subtitle_shadow_enabled || false}
                      onChange={(e) => handleChange('subtitle_shadow_enabled', e.target.checked)}
                    />
                  }
                  label="Schaduw inschakelen"
                />
                {settings.subtitle_shadow_enabled && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="X Offset"
                        value={settings.subtitle_shadow_x || 0}
                        onChange={(e) => handleChange('subtitle_shadow_x', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Y Offset"
                        value={settings.subtitle_shadow_y || 0}
                        onChange={(e) => handleChange('subtitle_shadow_y', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Blur"
                        value={settings.subtitle_shadow_blur || 0}
                        onChange={(e) => handleChange('subtitle_shadow_blur', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Spread"
                        value={settings.subtitle_shadow_spread || 0}
                        onChange={(e) => handleChange('subtitle_shadow_spread', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
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
                          '& .MuiInputBase-root': { height: 56 },
                          '& input': { 
                            cursor: 'pointer',
                            height: '100%'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* Logo Instellingen */}
      <TabPanel value={activeTab} index={1}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ 
                width: '200px',
                height: '100px',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
              }}>
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
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Logo Afmetingen</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Grootte (px)"
                    value={settings.logo_size || 60}
                    onChange={(e) => handleChange('logo_size', e.target.value)}
                    InputProps={{ inputProps: { min: 20, max: 400 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Marge Boven"
                    value={settings.logo_margin_top || 0}
                    onChange={(e) => handleChange('logo_margin_top', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Marge Links"
                    value={settings.logo_margin_left || 0}
                    onChange={(e) => handleChange('logo_margin_left', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Logo Schaduw</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.logo_shadow_enabled || false}
                    onChange={(e) => handleChange('logo_shadow_enabled', e.target.checked)}
                  />
                }
                label="Schaduw inschakelen"
              />
              {settings.logo_shadow_enabled && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="X Offset"
                      value={settings.logo_shadow_x || 0}
                      onChange={(e) => handleChange('logo_shadow_x', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Y Offset"
                      value={settings.logo_shadow_y || 0}
                      onChange={(e) => handleChange('logo_shadow_y', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Blur"
                      value={settings.logo_shadow_blur || 0}
                      onChange={(e) => handleChange('logo_shadow_blur', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Spread"
                      value={settings.logo_shadow_spread || 0}
                      onChange={(e) => handleChange('logo_shadow_spread', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
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
                        '& .MuiInputBase-root': { height: 56 },
                        '& input': { 
                          cursor: 'pointer',
                          height: '100%'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* Achtergrond Instellingen */}
      <TabPanel value={activeTab} index={2}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Achtergrondkleur
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                type="color"
                value={settings.background_color || '#FFFFFF'}
                onChange={(e) => handleChange('background_color', e.target.value)}
                sx={{
                  '& .MuiInputBase-root': { height: 56 },
                  '& input': { 
                    cursor: 'pointer',
                    height: '100%',
                    width: '100%'
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => handleChange('background_color', null)}
                size="small"
              >
                Reset
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Achtergrond Transparantie
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Transparantie"
                value={settings.background_opacity !== undefined ? settings.background_opacity : 1}
                onChange={(e) => handleChange('background_opacity', parseFloat(e.target.value))}
                inputProps={{ step: 0.1, min: 0, max: 1 }}
                helperText="0 = volledig transparant, 1 = volledig dekkend"
              />
            </Box>
            
            {/* Voeg de dynamische achtergrondkleur instelling hier toe */}
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useDynamicBackgroundColor}
                    onChange={(e) => setUseDynamicBackgroundColor(e.target.checked)}
                    color="primary"
                  />
                }
                label="Dynamische achtergrondkleur"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Als deze optie is ingeschakeld, wordt de achtergrondkleur automatisch aangepast aan de dominante kleur van de actieve foto in de slideshow.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" gutterBottom>
            Achtergrondpatroon
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
      </TabPanel>

      {/* Typografie Instellingen */}
      <TabPanel value={activeTab} index={3}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Lettertype Uploaden</Typography>
                <FontUploader onFontUploaded={() => {
                  // Herlaad de fonts in de FontPicker
                  const event = new Event('fontsUpdated');
                  window.dispatchEvent(event);
                }} />
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Menu & Content</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FontPicker
                    value={settings.font || 'system-ui'}
                    onChange={(value) => handleChange('font', value)}
                    label="Site Lettertype"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Menu lettergrootte"
                    value={settings.menu_font_size || 16}
                    onChange={(e) => handleChange('menu_font_size', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      inputProps: { min: 8, max: 72 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Content lettergrootte"
                    value={settings.content_font_size || 16}
                    onChange={(e) => handleChange('content_font_size', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      inputProps: { min: 8, max: 72 }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Footer</Typography>
              <Grid container spacing={2}>
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
                      '& .MuiInputBase-root': { height: 56 },
                      '& input': { 
                        cursor: 'pointer',
                        height: '100%'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* Gebruikers Beheer */}
      <TabPanel value={activeTab} index={4}>
        <UserManagement />
      </TabPanel>

      {/* E-mail Instellingen */}
      <TabPanel value={activeTab} index={5}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
          <EmailSettings />
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default Settings; 