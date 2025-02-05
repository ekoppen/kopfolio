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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {albums.length} album(s)
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Nieuw album
        </Button>
      </Box>

      <Grid container spacing={2}>
        {albums.map((album) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={album.id} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.1)',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '75%', // 4:3 aspect ratio
                  bgcolor: 'background.default'
                }}
              >
                {album.cover_photo ? (
                  <CardMedia
                    component="img"
                    image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${album.cover_photo}`}
                    alt={album.title}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PhotoIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  </Box>
                )}
                {album.is_home && (
                  <Chip
                    label="Home"
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8
                    }}
                  />
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {album.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {album.description || 'Geen beschrijving'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {album.photo_count} foto('s)
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => handlePhotoManagerClick(album)}
                  sx={{ mr: 1 }}
                >
                  <PhotoIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(album)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(album)}
                >
                  <DeleteIcon />
                </IconButton>
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