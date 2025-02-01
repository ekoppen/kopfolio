import React from 'react';
import { Box, Paper, Typography, Slider, TextField, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';

const PatternPicker = ({ 
  patterns, 
  selectedPattern, 
  patternOpacity, 
  patternScale,
  patternColor = '#FCF4FF',
  onPatternChange, 
  onOpacityChange, 
  onScaleChange,
  onColorChange
}) => {
  const theme = useTheme();
  const selectedPatternObj = patterns.find(p => p.value === selectedPattern) || patterns[0];

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Achtergrondpatroon</InputLabel>
        <Select
          value={selectedPattern}
          onChange={(e) => onPatternChange(e.target.value)}
          label="Achtergrondpatroon"
        >
          {patterns.map((pattern) => (
            <MenuItem key={pattern.value} value={pattern.value}>
              {pattern.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedPattern !== 'none' && (
        <Box sx={{ 
          width: '100%', 
          height: 300, 
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
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
            backgroundSize: `${patternScale * 100}%`,
            backgroundPosition: 'center',
            opacity: patternOpacity,
            transition: 'all 0.3s ease'
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
            opacity: 0.5
          }} />

          <Paper sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 300,
            p: 3,
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                KLEUR
              </Typography>
              <TextField
                type="color"
                size="small"
                value={patternColor}
                onChange={(e) => onColorChange(e.target.value)}
                fullWidth
                sx={{
                  '& input': { 
                    height: 40,
                    cursor: 'pointer'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                SCHAAL
              </Typography>
              <Slider
                value={patternScale}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(e, value) => onScaleChange(value)}
                sx={{ 
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16
                  }
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                TRANSPARANTIE
              </Typography>
              <Slider
                value={patternOpacity}
                min={0.01}
                max={0.25}
                step={0.01}
                onChange={(e, value) => onOpacityChange(value)}
                sx={{ 
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16
                  }
                }}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default PatternPicker; 