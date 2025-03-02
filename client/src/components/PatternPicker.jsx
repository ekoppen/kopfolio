import React, { useEffect } from 'react';
import { Box, Paper, Typography, Slider, TextField, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';

const PatternPicker = ({
  patterns = [], 
  selectedPattern = 'none', 
  patternOpacity = 0.15, 
  patternScale = 1,
  patternColor = '#FCF4FF',
  onPatternChange, 
  onOpacityChange, 
  onScaleChange,
  onColorChange
}) => {
  const theme = useTheme();
  const selectedPatternObj = patterns.find(p => p.value === selectedPattern);
  
  // Debug logging
  useEffect(() => {
    console.log('PatternPicker props:', {
      selectedPattern,
      patternOpacity,
      patternScale,
      patternColor,
      patternsCount: patterns.length
    });
  }, [selectedPattern, patternOpacity, patternScale, patternColor, patterns]);

  // Handler functies met extra logging
  const handlePatternChange = (value) => {
    console.log('Pattern gewijzigd naar:', value);
    onPatternChange(value);
  };
  
  const handleOpacityChange = (value) => {
    console.log('Opacity gewijzigd naar:', value);
    onOpacityChange(value);
  };
  
  const handleScaleChange = (value) => {
    console.log('Scale gewijzigd naar:', value);
    onScaleChange(value);
  };
  
  const handleColorChange = (value) => {
    console.log('Color gewijzigd naar:', value);
    onColorChange(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl sx={{ minWidth: 200, maxWidth: 400 }}>
        <InputLabel>Achtergrondpatroon</InputLabel>
        <Select
          value={selectedPattern}
          onChange={(e) => handlePatternChange(e.target.value)}
          label="Achtergrondpatroon"
        >
          {patterns.map((pattern) => (
            <MenuItem key={pattern.value} value={pattern.value}>
              {pattern.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedPattern !== 'none' && selectedPatternObj?.preview && (
        <Box sx={{ 
          width: '100%', 
          height: 400,
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
          mt: 4,
          mb: 3,
          border: 1,
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
        }}>
          {/* Pattern Preview Background */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedPatternObj.preview})`,
            backgroundSize: selectedPatternObj.type === 'svg'
              ? `${patternScale * 280}px`
              : `${Math.max(patternScale * 25, 10)}%`,
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            opacity: patternOpacity,
            transition: 'all 0.3s ease',
            imageRendering: selectedPatternObj.type === 'svg' ? 'auto' : 'crisp-edges'
          }} />

          {/* Color Overlay */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: patternColor,
            mixBlendMode: 'multiply',
            opacity: theme.palette.mode === 'dark' ? 1 : 0.5
          }} />

          <Paper sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 'auto',
            p: 2.5,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(30, 30, 30, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: 1,
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                KLEUR
              </Typography>
              <TextField
                type="color"
                size="small"
                value={patternColor}
                onChange={(e) => handleColorChange(e.target.value)}
                sx={{
                  width: 150,
                  '& input': { 
                    height: 36,
                    cursor: 'pointer',
                    padding: '4px'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                SCHAAL
              </Typography>
              <Box sx={{ width: 200 }}>
                <Slider
                  value={patternScale}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onChange={(e, value) => handleScaleChange(value)}
                  marks={[
                    { value: 0.1, label: 'Klein' },
                    { value: 1, label: 'Normaal' },
                    { value: 5, label: 'Groot' }
                  ]}
                  sx={{ 
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      width: 14,
                      height: 14
                    },
                    '& .MuiSlider-mark': {
                      height: 4
                    },
                    py: 1
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                TRANSPARANTIE
              </Typography>
              <Box sx={{ width: 200 }}>
                <Slider
                  value={patternOpacity}
                  min={0.01}
                  max={0.8}
                  step={0.01}
                  onChange={(e, value) => handleOpacityChange(value)}
                  marks={[
                    { value: 0.01, label: '1%' },
                    { value: 0.4, label: '40%' },
                    { value: 0.8, label: '80%' }
                  ]}
                  sx={{ 
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      width: 14,
                      height: 14
                    },
                    '& .MuiSlider-mark': {
                      height: 4
                    },
                    py: 1
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default PatternPicker; 