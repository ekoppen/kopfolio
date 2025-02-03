import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Button, Paper, Slider, TextField } from '@mui/material';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../utils/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const patternsResponse = await api.get('/settings/patterns');
        setPatterns([
          { name: 'Geen', value: 'none' },
          ...patternsResponse.data
        ]);
      } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Fout bij laden instellingen', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = async (field, value) => {
    try {
      const newSettings = { ...settings, [field]: value };
      const success = await updateSettings(newSettings);
      if (!success) {
        showToast('Fout bij opslaan instelling', 'error');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      showToast('Fout bij opslaan instelling', 'error');
    }
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Logo bestand is te groot (max 10MB)', 'error');
        return;
      }

      try {
        // Maak een aparte FormData alleen voor het logo
        const formData = new FormData();
        formData.append('logo', file);
        
        const response = await api.put('/settings/logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data) {
          setLogoPreview(URL.createObjectURL(file));
          const newSettings = { ...settings, logo: response.data.logo };
          updateSettings(newSettings);
          showToast('Logo succesvol geüpload', 'success');
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        showToast('Fout bij uploaden logo', 'error');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      // Verwijder het logo uit de settings voor de update
      const { logo, ...settingsWithoutLogo } = settings;
      const success = await updateSettings(settingsWithoutLogo);
      
      if (success) {
        showToast('Instellingen opgeslagen', 'success');
      } else {
        showToast('Fout bij opslaan instellingen', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Fout bij opslaan instellingen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedPattern = patterns.find(p => p.value === settings.sidebar_pattern);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Site Instellingen</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Achtergrondpatroon</Typography>
            
            <Box sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 0,
              mb: 3
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                p: 2,
                borderBottom: settings.sidebar_pattern !== 'none' ? '1px solid' : 'none',
                borderColor: 'divider'
              }}>
                {selectedPattern?.preview && (
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedPattern.preview})`,
                      backgroundSize: `${settings.pattern_scale * 100}%`,
                      backgroundPosition: 'center',
                      opacity: settings.pattern_opacity,
                      filter: `opacity(${settings.pattern_opacity}) drop-shadow(0 0 0 ${settings.pattern_color})`
                    }} />
                  </Box>
                )}
                <Select
                  value={settings.sidebar_pattern}
                  onChange={(e) => handleChange('sidebar_pattern', e.target.value)}
                  fullWidth
                  variant="standard"
                >
                  {patterns.map((pattern) => (
                    <MenuItem key={pattern.value} value={pattern.value}>
                      {pattern.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {settings.sidebar_pattern !== 'none' && (
                <Box sx={{ px: 3, py: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Patroon kleur</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Dit is de kleur van het patroon zelf. De kleur wordt automatisch transparant gemaakt.
                    </Typography>
                    <TextField
                      type="color"
                      value={settings.pattern_color || '#FCF4FF'}
                      onChange={(e) => handleChange('pattern_color', e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        '& input': { 
                          height: 40,
                          cursor: 'pointer'
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography gutterBottom>Patroon transparantie</Typography>
                    <Slider
                      value={settings.pattern_opacity}
                      min={0.01}
                      max={0.25}
                      step={0.01}
                      marks={[
                        { value: 0.01, label: '1%' },
                        { value: 0.05, label: '5%' },
                        { value: 0.1, label: '10%' },
                        { value: 0.15, label: '15%' },
                        { value: 0.2, label: '20%' },
                        { value: 0.25, label: '25%' }
                      ]}
                      onChange={(e, value) => handleChange('pattern_opacity', value)}
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom>Patroon grootte</Typography>
                    <Slider
                      value={settings.pattern_scale}
                      min={0.5}
                      max={3}
                      step={0.1}
                      marks={[
                        { value: 0.5, label: '50%' },
                        { value: 1, label: '100%' },
                        { value: 2, label: '200%' },
                        { value: 3, label: '300%' }
                      ]}
                      onChange={(e, value) => handleChange('pattern_scale', value)}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Logo</Typography>
            <Box sx={{ mb: 2 }}>
              {(logoPreview || settings.logo) && (
                <Box
                  component="img"
                  src={logoPreview || `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/branding/${settings.logo}`}
                  alt="Site Logo"
                  sx={{
                    maxWidth: 200,
                    maxHeight: 100,
                    objectFit: 'contain',
                    mb: 2
                  }}
                />
              )}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleLogoChange}
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Logo Uploaden
                </Button>
              </label>
            </Box>
          </Paper>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            sx={{ mt: 2 }}
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </form>
      )}
    </Box>
  );
};

export default Settings; 