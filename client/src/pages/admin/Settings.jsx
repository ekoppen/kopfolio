import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Button, Paper, Slider, TextField } from '@mui/material';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    site_title: '',
    site_subtitle: '',
    subtitle_font: 'Roboto',
    subtitle_size: 14,
    subtitle_color: '#FFFFFF',
    accent_color: '#000000',
    font: 'Roboto',
    subtitle_margin_top: 0,
    subtitle_margin_left: 0,
    sidebar_pattern: 'none',
    pattern_opacity: 0.1,
    pattern_scale: 1,
    pattern_color: '#FCF4FF'
  });
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsResponse, patternsResponse] = await Promise.all([
          api.get('/settings'),
          api.get('/settings/patterns')
        ]);
        setSettings(settingsResponse.data);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      showToast('Instellingen opgeslagen', 'success');
      // Trigger een window event om de App component te informeren
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: settings
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Fout bij opslaan instellingen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
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
                      opacity: settings.pattern_opacity
                    }} />
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: settings.pattern_color,
                      mixBlendMode: 'multiply',
                      opacity: 0.5
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