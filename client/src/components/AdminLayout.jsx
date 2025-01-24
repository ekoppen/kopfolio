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
  IconButton,
  useTheme
} from '@mui/material';
import {
  Photo as PhotoIcon,
  Collections as AlbumIcon,
  Article as PageIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { ThemeContext } from '../contexts/ThemeContext';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = React.useContext(ThemeContext);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Albums', icon: <AlbumIcon />, path: '/admin/albums' },
    { text: "Foto's", icon: <PhotoIcon />, path: '/admin/fotos' },
    { text: "Pagina's", icon: <PageIcon />, path: '/admin/paginas' }
  ];

  // Bepaal de actieve pagina
  const activePage = menuItems.find(item => location.pathname === item.path);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: 64,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
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
              color: 'text.primary'
            }}
          >
            {activePage ? activePage.text : 'Kopfolio Admin'}
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ExitIcon />}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'primary.50'
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
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            boxShadow: 'none',
            bgcolor: 'background.paper',
            pt: 8,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ overflow: 'auto', px: 2, py: 3, flex: 1 }}>
          <List sx={{ '& .MuiListItem-root': { mb: 1 } }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={RouterLink} 
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'primary.50',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      }
                    },
                    '&.Mui-selected': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'primary.50',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'primary.50',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'text.secondary',
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
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200' }}>
          <IconButton
            onClick={toggleDarkMode}
            size="medium"
            sx={{
              width: '100%',
              color: 'text.secondary',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
              borderRadius: 2,
              py: 1,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'grey.200',
                borderColor: theme.palette.mode === 'dark' ? 'primary.700' : 'primary.200',
                color: 'primary.main'
              }
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
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