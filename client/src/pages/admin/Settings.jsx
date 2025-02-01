import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Button } from '@mui/material';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const Settings = () => {
  const [settings, setSettings] = useState(null);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
  };

  const handleChange = (field, value) => {
    // Handle field change
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Site Instellingen</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          {/* ... andere form velden ... */}
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Achtergrond Patroon</InputLabel>
            <Select
              value={settings.sidebar_pattern || 'none'}
              onChange={(e) => handleChange('sidebar_pattern', e.target.value)}
              label="Achtergrond Patroon"
            >
              {patterns.map((pattern) => (
                <MenuItem key={pattern.value} value={pattern.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {pattern.preview ? (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          overflow: 'hidden',
                          backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}${pattern.preview})`,
                          bgcolor: 'background.paper'
                        }}
                      />
                    ) : null}
                    <Typography>{pattern.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ... andere form velden ... */}

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