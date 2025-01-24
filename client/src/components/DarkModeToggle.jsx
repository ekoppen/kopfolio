import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useCustomTheme();
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50',
        borderRadius: 2,
        p: 0.5,
        display: 'flex',
        alignItems: 'center',
        border: '2px solid',
        borderColor: theme.palette.mode === 'dark' ? 'primary.700' : 'primary.200',
        boxShadow: theme.palette.mode === 'dark' ? '0 0 8px rgba(144, 202, 249, 0.2)' : '0 0 8px rgba(25, 118, 210, 0.2)',
      }}
    >
      <Tooltip title={isDarkMode ? 'Lichte modus' : 'Donkere modus'}>
        <IconButton
          onClick={toggleDarkMode}
          size="medium"
          sx={{
            color: theme.palette.mode === 'dark' ? 'primary.200' : 'primary.700',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'rotate(180deg)',
              color: 'primary.main',
              bgcolor: 'transparent'
            }
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DarkModeToggle; 