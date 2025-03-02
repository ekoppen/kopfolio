import React, { useState } from 'react';
import { Box, Popover, TextField, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const ColorCircle = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  cursor: 'pointer',
  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.5)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.7)' 
      : '0 4px 12px rgba(0, 0, 0, 0.2)',
  }
}));

const ColorPicker = ({ value, onChange, label }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [color, setColor] = useState(value || '#000000');

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setTimeout(() => {
      const colorInput = document.getElementById('color-picker-input');
      if (colorInput) {
        colorInput.click();
      }
    }, 100);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {label && <Typography variant="body2">{label}</Typography>}
      <ColorCircle 
        sx={{ backgroundColor: color }}
        onClick={handleClick}
        aria-describedby={id}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            id="color-picker-input"
            type="color"
            value={color}
            onChange={handleChange}
            sx={{
              width: 200,
              '& .MuiInputBase-root': { height: 56 },
              '& input': { 
                cursor: 'pointer',
                height: '100%'
              }
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default ColorPicker; 