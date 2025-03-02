import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Slider, TextField, useTheme } from '@mui/material';
import ColorPicker from './ColorPicker';

const PatternPicker = ({ 
  patterns = [], 
  value = 'none',
  onChange,
  onOpacityChange,
  onScaleChange,
  onColorChange,
  patternOpacity = 0.1,
  patternScale = 1,
  patternColor = '#000000'
}) => {
  const theme = useTheme();
  const [selectedPattern, setSelectedPattern] = useState(value);
  const [opacity, setOpacity] = useState(patternOpacity);
  const [scale, setScale] = useState(patternScale);
  const [color, setColor] = useState(patternColor);

  useEffect(() => {
    setSelectedPattern(value);
  }, [value]);

  useEffect(() => {
    setOpacity(patternOpacity);
  }, [patternOpacity]);

  useEffect(() => {
    setScale(patternScale);
  }, [patternScale]);

  useEffect(() => {
    setColor(patternColor);
  }, [patternColor]);

  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
    if (onChange) {
      onChange(pattern);
    }
  };

  const handleOpacityChange = (event, newValue) => {
    setOpacity(newValue);
    if (onOpacityChange) {
      onOpacityChange(newValue);
    }
  };

  const handleScaleChange = (event, newValue) => {
    setScale(newValue);
    if (onScaleChange) {
      onScaleChange(newValue);
    }
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (onColorChange) {
      onColorChange(newColor);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {patterns.map((pattern) => (
          <Grid item xs={4} sm={3} md={2} key={pattern.value}>
            <Box
              onClick={() => handlePatternClick(pattern.value)}
              sx={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: selectedPattern === pattern.value 
                  ? theme.palette.primary.main 
                  : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 12px rgba(0, 0, 0, 0.5)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                position: 'relative',
                backgroundImage: pattern.value !== 'none' 
                  ? `url(${import.meta.env.VITE_API_URL.replace('/api', '')}/patterns/${pattern.value})` 
                  : 'none',
                backgroundSize: `${scale * 100}%`,
                backgroundColor: pattern.value === 'none' 
                  ? theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
                  : 'transparent',
              }}
            >
              {pattern.value === 'none' && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    color: theme.palette.text.secondary
                  }}
                >
                  Geen
                </Typography>
              )}
            </Box>
            <Typography 
              variant="caption" 
              align="center" 
              sx={{ 
                display: 'block', 
                mt: 0.5,
                color: selectedPattern === pattern.value 
                  ? theme.palette.primary.main 
                  : theme.palette.text.secondary,
                fontWeight: selectedPattern === pattern.value ? 'medium' : 'normal'
              }}
            >
              {pattern.name}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {selectedPattern !== 'none' && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Voorbeeld van geselecteerd patroon</Typography>
              <Box
                sx={{
                  width: '100%',
                  height: '120px',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  backgroundImage: `url(${import.meta.env.VITE_API_URL.replace('/api', '')}/patterns/${selectedPattern})`,
                  backgroundSize: `${scale * 100}%`,
                  opacity: opacity,
                  mb: 3
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom variant="body2">Transparantie</Typography>
              <Slider
                value={opacity}
                onChange={handleOpacityChange}
                min={0}
                max={1}
                step={0.05}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom variant="body2">Schaal</Typography>
              <Slider
                value={scale}
                onChange={handleScaleChange}
                min={0.1}
                max={5}
                step={0.1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}x`}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom variant="body2">Kleur</Typography>
              <ColorPicker
                value={color}
                onChange={handleColorChange}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PatternPicker; 