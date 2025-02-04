import { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import api from '../utils/api';

const FontPicker = ({ 
  value = 'system-ui',
  onChange,
  label = 'Lettertype'
}) => {
  const [fonts, setFonts] = useState([]);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await api.get('/settings/fonts');
        console.log('Loaded fonts from server:', response.data);
        setFonts(response.data);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFonts([
          { name: 'System Default', value: 'system-ui', type: 'system' },
          { name: 'Arial', value: 'Arial', type: 'system' },
          { name: 'Helvetica', value: 'Helvetica', type: 'system' },
          { name: 'Verdana', value: 'Verdana', type: 'system' },
          { name: 'Georgia', value: 'Georgia', type: 'system' },
          { name: 'Times New Roman', value: 'Times New Roman', type: 'system' }
        ]);
      }
    };

    loadFonts();
  }, []);

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => {
          const selectedFont = fonts.find(f => f.value === e.target.value);
          console.log('Selected font:', selectedFont);
          if (selectedFont) {
            onChange(selectedFont.value);
          }
        }}
        label={label}
      >
        {fonts.map((font) => {
          console.log('Rendering font item:', font);
          const fontFamily = font.type === 'system' ? font.value : `'${font.value}'`;
          console.log('Using font-family:', fontFamily);
          
          return (
            <MenuItem 
              key={font.value} 
              value={font.value}
              sx={{
                fontFamily: fontFamily,
                transition: 'opacity 0.3s ease'
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  variant="body1"
                  component="span"
                  sx={{ 
                    fontFamily: fontFamily,
                    display: 'block'
                  }}
                >
                  {font.name}
                </Typography>
                {font.type !== 'system' && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block',
                      mt: 0.5,
                      fontFamily: 'system-ui'
                    }}
                  >
                    Custom Font (.{font.type})
                  </Typography>
                )}
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default FontPicker; 