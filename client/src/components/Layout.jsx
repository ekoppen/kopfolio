import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, useTheme } from '@mui/material';
import Navigation from './Navigation';

const Layout = () => {
  const theme = useTheme();
  
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
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          height: 64
        }}
      >
        <Toolbar sx={{ height: '100%' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: 'grey.800'
            }}
          >
            Kopfolio
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
          }
        }}
      >
        <Outlet />
      </Container>

      <Box 
        component="footer" 
        sx={{ 
          py: 4,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
            sx={{ fontWeight: 500 }}
          >
            © {new Date().getFullYear()} Kopfolio
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 