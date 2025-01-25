import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Paper,
  Tooltip,
  useTheme,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Photo as PhotoIcon,
  Collections as CollectionsIcon
} from '@mui/icons-material';
import AlbumForm from '../../components/AlbumForm';
import AlbumPhotoManager from '../../components/AlbumPhotoManager';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const AdminAlbums = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [photoManagerOpen, setPhotoManagerOpen] = useState(false);

  const loadAlbums = async () => {
    try {
      const response = await api.get('/albums');
      setAlbums(response.data);
    } catch (error) {
      console.error('Fout bij ophalen albums:', error);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const handleDeleteClick = (album) => {
    setSelectedAlbum(album);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/albums/${selectedAlbum.id}`);
      setAlbums(albums.filter(a => a.id !== selectedAlbum.id));
      setDeleteDialogOpen(false);
      setSelectedAlbum(null);
      showToast('Album succesvol verwijderd', 'success');
    } catch (error) {
      showToast('Fout bij verwijderen album', 'error');
    }
  };

  const handleEditClick = (album) => {
    setSelectedAlbum(album);
    setEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadAlbums();
    setEditDialogOpen(false);
    setCreateDialogOpen(false);
    setSelectedAlbum(null);
  };

  const handlePhotoManagerClick = (album) => {
    setSelectedAlbum(album);
    setPhotoManagerOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {albums.length} album(s)
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
          sx={{ 
            minWidth: 0, 
            width: 40, 
            height: 40, 
            p: 0,
            borderRadius: 2
          }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Grid container spacing={2}>
        {albums.map((album) => (
          <Grid item xs={12} sm={6} md={4} key={album.id}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                minWidth: 200,
                maxWidth: 350,
                width: '100%',
                mx: 'auto',
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
              }}
            >
              {album.cover_photo ? (
                <CardMedia
                  component="img"
                  height="220"
                  image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${album.cover_photo}`}
                  alt={album.title}
                  sx={{ 
                    objectFit: 'cover',
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 220,
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <CollectionsIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  <Typography variant="body2" color="text.secondary">
                    Geen foto's
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                    {album.title}
                  </Typography>
                  {album.is_home && (
                    <Chip 
                      label="Home" 
                      color="primary" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  paragraph
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 40
                  }}
                >
                  {album.description || 'Geen beschrijving'}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary'
                  }}
                >
                  <PhotoIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    {album.photo_count} foto's
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <CardActions sx={{ px: 2, py: 1 }}>
                <Tooltip title="Foto's beheren">
                  <IconButton
                    size="small"
                    onClick={() => handlePhotoManagerClick(album)}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'primary.50' }
                    }}
                  >
                    <PhotoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Album bewerken">
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(album)}
                    sx={{ 
                      color: 'info.main',
                      '&:hover': { bgcolor: 'info.50' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={album.is_home ? 'Home album kan niet verwijderd worden' : 'Album verwijderen'}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(album)}
                      disabled={album.is_home}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.50' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Album verwijderen</DialogTitle>
        <DialogContent>
          <Typography>
            Weet je zeker dat je het album "{selectedAlbum?.title}" wilt verwijderen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuleren</Button>
          <Button onClick={handleDeleteConfirm} color="error">Verwijderen</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Album bewerken</DialogTitle>
        <DialogContent>
          <AlbumForm 
            album={selectedAlbum} 
            onSubmitSuccess={handleFormSuccess}
            onCancel={() => setEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nieuw album</DialogTitle>
        <DialogContent>
          <AlbumForm 
            onSubmitSuccess={handleFormSuccess}
            onCancel={() => setCreateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={photoManagerOpen} 
        onClose={() => setPhotoManagerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Foto's beheren - {selectedAlbum?.title}</DialogTitle>
        <DialogContent sx={{ bgcolor: 'transparent', p: 0 }}>
          <AlbumPhotoManager 
            open={photoManagerOpen}
            onClose={() => setPhotoManagerOpen(false)}
            albumId={selectedAlbum?.id}
            onUpdate={loadAlbums}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminAlbums; 