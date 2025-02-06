import { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import {
  Google as GoogleIcon,
  Upload as UploadIcon,
  Laptop as SystemIcon
} from '@mui/icons-material';
import api from '../utils/api';

const FontPicker = ({ 
  value = 'system-ui',
  onChange,
  label = 'Lettertype'
}) => {
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Laad eerst de server fonts
        const response = await api.get('/settings/fonts');
        const serverFonts = response.data.map(font => ({
          ...font,
          id: `server-${font.value}`
        }));

        // Voeg Google Fonts toe
        const googleFonts = [
          { name: 'Open Sans', value: 'Open Sans', type: 'google', id: 'google-open-sans' },
          { name: 'Roboto', value: 'Roboto', type: 'google', id: 'google-roboto' },
          { name: 'Lato', value: 'Lato', type: 'google', id: 'google-lato' },
          { name: 'Montserrat', value: 'Montserrat', type: 'google', id: 'google-montserrat' },
          { name: 'Poppins', value: 'Poppins', type: 'google', id: 'google-poppins' }
        ];

        // Voeg system fonts toe
        const systemFonts = [
          { name: 'System Default', value: 'system-ui', type: 'system', id: 'system-default' },
          { name: 'Arial', value: 'Arial', type: 'system', id: 'system-arial' },
          { name: 'Helvetica', value: 'Helvetica', type: 'system', id: 'system-helvetica' },
          { name: 'Verdana', value: 'Verdana', type: 'system', id: 'system-verdana' },
          { name: 'Georgia', value: 'Georgia', type: 'system', id: 'system-georgia' },
          { name: 'Times New Roman', value: 'Times New Roman', type: 'system', id: 'system-times-new-roman' }
        ];

        // Combineer alle fonts
        const allFonts = [...googleFonts, ...systemFonts, ...serverFonts];
        setFonts(allFonts);

      } catch (error) {
        console.error('Error loading fonts:', error);
        // Fallback naar system fonts als er iets misgaat
        setFonts([
          { name: 'System Default', value: 'system-ui', type: 'system', id: 'system-default' },
          { name: 'Arial', value: 'Arial', type: 'system', id: 'system-arial' },
          { name: 'Helvetica', value: 'Helvetica', type: 'system', id: 'system-helvetica' },
          { name: 'Verdana', value: 'Verdana', type: 'system', id: 'system-verdana' },
          { name: 'Georgia', value: 'Georgia', type: 'system', id: 'system-georgia' },
          { name: 'Times New Roman', value: 'Times New Roman', type: 'system', id: 'system-times-new-roman' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  // Laad Google Fonts alleen bij initialisatie
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Roboto:wght@400;500&family=Lato:wght@400;700&family=Montserrat:wght@400;500&family=Poppins:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const getIconForFontType = (type) => {
    switch (type) {
      case 'google':
        return <GoogleIcon sx={{ fontSize: 16, color: 'primary.main' }} />;
      case 'system':
        return <SystemIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
      default:
        return <UploadIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => {
          const selectedFont = fonts.find(f => f.value === e.target.value);
          if (selectedFont) {
            onChange(selectedFont.value);
          }
        }}
        label={label}
      >
        {fonts.map((font) => {
          const fontFamily = font.type === 'system' ? font.value : `'${font.value}'`;
          
          return (
            <MenuItem 
              key={font.id}
              value={font.value}
              sx={{
                fontFamily: fontFamily,
                transition: 'opacity 0.3s ease'
              }}
            >
              <Box sx={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                {getIconForFontType(font.type)}
                <Typography 
                  variant="body1"
                  component="span"
                  sx={{ 
                    fontFamily: fontFamily,
                    flex: 1
                  }}
                >
                  {font.name}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default FontPicker; 