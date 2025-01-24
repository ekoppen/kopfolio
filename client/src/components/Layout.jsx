import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Navigation from './Navigation';
import api from '../utils/api';

console.log('Layout.jsx wordt geladen!');

const Layout = () => {
  console.log('Layout component wordt gerenderd!');
  
  const theme = useTheme();
  const [siteTitle, setSiteTitle] = useState('Kopfolio');
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data.site_title) {
          setSiteTitle(response.data.site_title);
        }
      } catch (error) {
        console.error('Fout bij laden site titel:', error);
      }
    };

    loadSettings();
  }, []);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'common.white',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        }}
      >
        <Toolbar sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: theme.palette.mode === 'dark' ? 'common.white' : 'grey.800'
            }}
          >
            {siteTitle}
          </Typography>
          <Navigation />
        </Toolbar>
      </AppBar>

      <Container 
        component="main" 
        sx={{ 
          flex: 1, 
          py: 4,
          px: {
            xs: 2,
            sm: 3,
            md: 4
          },
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
        }}
      >
        <Outlet />
      </Container>

      <Box 
        component="footer" 
        sx={{ 
          py: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'common.white',
          borderTop: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            color={theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary'}
            align="center"
            sx={{ fontWeight: 500 }}
          >
            © {new Date().getFullYear()} {siteTitle}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 