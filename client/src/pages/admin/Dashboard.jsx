import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Collections as AlbumIcon,
  PhotoLibrary as PhotoIcon,
  Article as PageIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalAlbums: 0,
    totalPages: 0
  });

  const loadStats = async () => {
    try {
      const [photosRes, albumsRes, pagesRes] = await Promise.all([
        api.get('/photos'),
        api.get('/albums'),
        api.get('/pages')
      ]);
      
      setStats({
        totalPhotos: photosRes.data.length,
        totalAlbums: albumsRes.data.length,
        totalPages: pagesRes.data.length
      });
    } catch (error) {
      console.error('Fout bij ophalen statistieken:', error);
      showToast('Fout bij ophalen statistieken', 'error');
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCreateBackup = async () => {
    try {
      const response = await api.get('/backup/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Backup succesvol gedownload', 'success');
    } catch (error) {
      console.error('Fout bij maken backup:', error);
      showToast('Fout bij maken backup', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        Dashboard
      </Typography>

      {/* Statistieken */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0}
            onClick={() => navigate('/admin/fotos')}
            sx={{ 
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
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
            onClick={() => navigate('/admin/albums')}
            sx={{ 
              bgcolor: 'success.50',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
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
            onClick={() => navigate('/admin/paginas')}
            sx={{ 
              bgcolor: 'info.50',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
              }
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

      {/* Backup & Restore */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          mt: 3,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
          Backup & Restore
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Backup maken
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download een volledige backup van je site, inclusief alle instellingen, database, branding en uploads.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                onClick={handleCreateBackup}
                sx={{ borderRadius: 2 }}
              >
                Backup maken
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Backup terugzetten
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Zet een eerder gemaakte backup terug. Let op: dit overschrijft alle huidige gegevens.
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<RestoreIcon />}
                sx={{ borderRadius: 2 }}
              >
                Backup terugzetten
                <input
                  type="file"
                  hidden
                  accept=".zip"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('backup', file);

                    try {
                      await api.post('/backup/import', formData, {
                        headers: {
                          'Content-Type': 'multipart/form-data'
                        }
                      });
                      showToast('Backup succesvol teruggezet', 'success');
                      window.location.reload();
                    } catch (error) {
                      console.error('Fout bij terugzetten backup:', error);
                      showToast('Fout bij terugzetten backup', 'error');
                    }
                  }}
                />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;