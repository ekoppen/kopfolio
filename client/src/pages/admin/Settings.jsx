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
  Email as EmailIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import PatternPicker from '../../components/PatternPicker';
import FontPicker from '../../components/FontPicker';
import FontUploader from '../../components/FontUploader';
import { useSettings } from '../../contexts/SettingsContext';
import UserManagement from '../../components/UserManagement';
import EmailSettings from '../../components/EmailSettings';
import ColorPicker from '../../components/ColorPicker';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      p: 2, 
      maxWidth: '100%',
      marginLeft: 0,
      transition: 'margin-left 0.3s',
      marginTop: '64px'
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Instellingen</Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<SettingsIcon />} label="Algemeen" />
            <Tab icon={<ImageIcon />} label="Logo" />
            <Tab icon={<PaletteIcon />} label="Achtergrond" />
            <Tab icon={<TextFieldsIcon />} label="Typografie" />
            <Tab icon={<FormatSizeIcon />} label="Menu" />
            <Tab icon={<PeopleIcon />} label="Gebruikers" />
            <Tab icon={<EmailIcon />} label="E-mail" />
          </Tabs>
        </Box>
        
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

        {/* Algemene Instellingen */}
        <TabPanel value={activeTab} index={0}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
            <Typography variant="h6" gutterBottom>Algemene Instellingen</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Website Titel</Typography>
                <TextField
                  fullWidth
                  label="Website Titel"
                  value={settings.site_title || ''}
                  onChange={(e) => handleChange('site_title', e.target.value)}
                />
              </Grid>
              
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
                    <ColorPicker
                      label="Tekstkleur"
                      value={settings.subtitle_color || '#000000'}
                      onChange={(value) => handleChange('subtitle_color', value)}
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
                        <ColorPicker
                          label="Schaduw Kleur"
                          value={settings.subtitle_shadow_color || '#000000'}
                          onChange={(value) => handleChange('subtitle_shadow_color', value)}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Accentkleur</Typography>
                <ColorPicker
                  label="Accentkleur"
                  value={settings.accent_color || '#1976d2'}
                  onChange={(value) => handleChange('accent_color', value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Footer</Typography>
                <TextField
                  fullWidth
                  label="Footer Tekst"
                  value={settings.footer_text || ''}
                  onChange={(e) => handleChange('footer_text', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Logo Instellingen */}
        <TabPanel value={activeTab} index={1}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
            <Typography variant="h6" gutterBottom>Logo Instellingen</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 3,
                  border: '1px dashed',
                  borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                  borderRadius: 2,
                  minHeight: 200
                }}>
                  {logoPreview ? (
                    <Box sx={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 150,
                          objectFit: 'contain'
                        }} 
                      />
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          top: -12, 
                          right: -12,
                          bgcolor: theme.palette.background.paper,
                          boxShadow: 1
                        }}
                        onClick={() => {
                          handleChange('logo', null);
                          setLogoPreview(null);
                        }}
                      >
                        <UploadIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Sleep een afbeelding hierheen of klik om te uploaden
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadIcon />}
                        disabled={loading}
                      >
                        Logo Uploaden
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Logo Instellingen</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Logo Grootte"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      }}
                      value={settings.logo_size || 200}
                      onChange={(e) => handleChange('logo_size', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Logo Positie</InputLabel>
                      <Select
                        value={settings.logo_position || 'left'}
                        onChange={(e) => handleChange('logo_position', e.target.value)}
                        label="Logo Positie"
                      >
                        <MenuItem value="left">Links</MenuItem>
                        <MenuItem value="top">Boven</MenuItem>
                        <MenuItem value="full-left">Volledig Links</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Marge Boven"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      }}
                      value={settings.logo_margin_top || 0}
                      onChange={(e) => handleChange('logo_margin_top', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Marge Links"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      }}
                      value={settings.logo_margin_left || 0}
                      onChange={(e) => handleChange('logo_margin_left', e.target.value)}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>Logo Schaduw</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.logo_shadow_enabled || false}
                        onChange={(e) => handleChange('logo_shadow_enabled', e.target.checked)}
                      />
                    }
                    label="Schaduw weergeven"
                  />
                  {settings.logo_shadow_enabled && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Schaduw Blur"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                          }}
                          value={settings.logo_shadow_blur || 5}
                          onChange={(e) => handleChange('logo_shadow_blur', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <ColorPicker
                          label="Schaduw Kleur"
                          value={settings.logo_shadow_color || '#000000'}
                          onChange={(value) => handleChange('logo_shadow_color', value)}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Achtergrond Instellingen */}
        <TabPanel value={activeTab} index={2}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
            <Typography variant="h6" gutterBottom>Achtergrond Instellingen</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Achtergrondkleur</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <ColorPicker
                      label="Achtergrondkleur"
                      value={settings.background_color || '#ffffff'}
                      onChange={(color) => handleChange('background_color', color)}
                    />
                  </Grid>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      label="Transparantie"
                      type="number"
                      inputProps={{ min: 0, max: 1, step: 0.1 }}
                      value={settings.background_opacity !== undefined ? settings.background_opacity : 1}
                      onChange={(e) => handleChange('background_opacity', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Dynamische Achtergrondkleur</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useDynamicBackgroundColor}
                      onChange={(e) => {
                        setUseDynamicBackgroundColor(e.target.checked);
                        handleChange('use_dynamic_background_color', e.target.checked);
                      }}
                    />
                  }
                  label="Gebruik dynamische achtergrondkleur op basis van foto's"
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Wanneer ingeschakeld, wordt de achtergrondkleur automatisch aangepast aan de dominante kleur van de getoonde foto's.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Achtergrond Patroon</Typography>
                <PatternPicker
                  patterns={patterns}
                  value={settings.sidebar_pattern || 'none'}
                  onChange={(value) => handleChange('sidebar_pattern', value)}
                  patternOpacity={settings.pattern_opacity !== undefined ? settings.pattern_opacity : 0.1}
                  patternScale={settings.pattern_scale || 1}
                  patternColor={settings.pattern_color || '#000000'}
                  onOpacityChange={(value) => handleChange('pattern_opacity', value)}
                  onScaleChange={(value) => handleChange('pattern_scale', value)}
                  onColorChange={(value) => handleChange('pattern_color', value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Typografie Instellingen */}
        <TabPanel value={activeTab} index={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
            <Typography variant="h6" gutterBottom>Typografie Instellingen</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Lettertypen</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FontPicker
                      value={settings.font || 'system-ui'}
                      onChange={(value) => handleChange('font', value)}
                      label="Primair Lettertype"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FontUploader onUploadSuccess={loadSettings} />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Tekstgrootte</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Menu Tekstgrootte"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      }}
                      value={settings.menu_font_size || 16}
                      onChange={(e) => handleChange('menu_font_size', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Content Tekstgrootte"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">px</InputAdornment>,
                      }}
                      value={settings.content_font_size || 16}
                      onChange={(e) => handleChange('content_font_size', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Gebruikers Instellingen */}
        <TabPanel value={activeTab} index={4}>
          <UserManagement />
        </TabPanel>

        {/* E-mail Instellingen */}
        <TabPanel value={activeTab} index={5}>
          <EmailSettings />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Settings; 