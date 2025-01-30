import React, { useState } from 'react';
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
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PhotoLibrary as PhotoIcon,
  Collections as AlbumIcon,
  Article as PageIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { ThemeContext } from '../contexts/ThemeContext';

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 64;

const AdminLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = React.useContext(ThemeContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
    const savedState = localStorage.getItem('adminDrawerOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Albums', icon: <AlbumIcon />, path: '/admin/albums' },
    { text: "Foto's", icon: <PhotoIcon />, path: '/admin/fotos' },
    { text: "Pagina's", icon: <PageIcon />, path: '/admin/paginas' }
  ];

  // Bepaal de actieve pagina
  const activePage = menuItems.find(item => location.pathname === item.path);

  const handleDrawerToggle = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(newState);
    localStorage.setItem('adminDrawerOpen', JSON.stringify(newState));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.default'
    }}>
      <IconButton
        onClick={handleDrawerToggle}
        sx={{ 
          position: 'fixed',
          top: 12,
          left: isDrawerOpen ? 
            DRAWER_WIDTH - 28 : 
            (COLLAPSED_DRAWER_WIDTH - 40) / 2,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['left', 'background-color'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'
          }
        }}
      >
        {isDrawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
      </IconButton>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? isDrawerOpen : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
          }
        }}
        sx={{
          width: isDrawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: isDrawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            boxShadow: 'none',
            transition: theme.transitions.create(['width', 'background-color'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }
        }}
      >
        <Box sx={{ overflow: 'auto', px: isDrawerOpen ? 2 : 1, flex: 1, mt: 8 }}>
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
                    minHeight: 48,
                    justifyContent: isDrawerOpen ? 'initial' : 'center',
                    px: isDrawerOpen ? 2.5 : 2,
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
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isDrawerOpen ? 3 : 0,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {isDrawerOpen && <ListItemText primary={item.text} />}
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
          height: '100vh',
          overflow: 'auto',
          width: {
            xs: '100%',
            sm: `calc(100% - ${isDrawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)`
          },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.default'
        }}
      >
        <Box 
          sx={{ 
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            borderBottom: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            backdropFilter: 'blur(8px)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
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
          </Box>
        </Box>
        <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout; 