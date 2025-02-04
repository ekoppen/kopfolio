import React from 'react';
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

      {selectedPattern !== 'none' && selectedPatternObj?.preview && (
        <Box sx={{ 
          width: '100%', 
          height: 400,
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
            width: 300,
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
                onChange={(e) => onColorChange(e.target.value)}
                fullWidth
                sx={{
                  '& input': { 
                    height: 36,
                    cursor: 'pointer'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                SCHAAL
              </Typography>
              <Slider
                value={patternScale}
                min={0.1}
                max={5}
                step={0.1}
                onChange={(e, value) => onScaleChange(value)}
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

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                TRANSPARANTIE
              </Typography>
              <Slider
                value={patternOpacity}
                min={0.01}
                max={0.8}
                step={0.01}
                onChange={(e, value) => onOpacityChange(value)}
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
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default PatternPicker; 