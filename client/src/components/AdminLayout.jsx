import React from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
  useTheme
} from '@mui/material';
import {
  Photo as PhotoIcon,
  Collections as AlbumIcon,
  Article as PageIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Albums', icon: <AlbumIcon />, path: '/admin/albums' },
    { text: "Foto's", icon: <PhotoIcon />, path: '/admin/fotos' },
    { text: "Pagina's", icon: <PageIcon />, path: '/admin/paginas' }
  ];

  // Bepaal de actieve pagina
  const activePage = menuItems.find(item => location.pathname === item.path);

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: 64,
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
            {activePage ? activePage.text : 'Kopfolio Admin'}
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ExitIcon />}
            sx={{ 
              color: 'grey.700',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
          >
            Terug naar site
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'grey.200',
            boxShadow: 'none',
            pt: 8
          }
        }}
      >
        <Box sx={{ overflow: 'auto', px: 2, py: 3 }}>
          <List sx={{ '& .MuiListItem-root': { mb: 1 } }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={RouterLink} 
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    color: 'grey.700',
                    '&:hover': {
                      bgcolor: 'grey.50',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      }
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.50',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'grey.500',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontSize: '0.9375rem',
                      fontWeight: 500
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 3,
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Box sx={{ pl: 0, pr: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout; 