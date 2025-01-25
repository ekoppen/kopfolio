import React from 'react';
import { Grid, Card, CardContent, Box, Typography } from '@mui/material';
import { PhotoIcon, AlbumIcon, PageIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Dashboard = () => {
  const theme = useTheme();
  const stats = {
    totalPhotos: 123,
    totalAlbums: 45,
    totalPages: 78
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card 
          elevation={0} 
          sx={{ 
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PhotoIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 500, color: 'primary.main' }}>
                  {stats.totalPhotos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Foto's
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card 
          elevation={0} 
          sx={{ 
            bgcolor: 'success.50',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AlbumIcon sx={{ color: 'success.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 500, color: 'success.main' }}>
                  {stats.totalAlbums}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Albums
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card 
          elevation={0} 
          sx={{ 
            bgcolor: 'info.50',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PageIcon sx={{ color: 'info.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 500, color: 'info.main' }}>
                  {stats.totalPages}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pagina's
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard; 