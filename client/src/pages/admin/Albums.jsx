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

const AdminAlbums = () => {
  const theme = useTheme();
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
    } catch (error) {
      console.error('Fout bij verwijderen album:', error);
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
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CollectionsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'medium' }}>
            Albums Beheren
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Nieuw Album
        </Button>
      </Paper>

      <Grid container spacing={3}>
        {albums.map((album) => (
          <Grid item xs={12} sm={6} md={4} key={album.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              {album.cover_photo ? (
                <CardMedia
                  component="img"
                  height="220"
                  image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${album.cover_photo}`}
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
                    bgcolor: 'grey.100',
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Album verwijderen</DialogTitle>
        <DialogContent>
          <Typography>
            Weet je zeker dat je het album "{selectedAlbum?.title}" wilt verwijderen?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuleren
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Album bewerken</DialogTitle>
        <DialogContent>
          <AlbumForm
            album={selectedAlbum}
            onSubmitSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Nieuw Album</DialogTitle>
        <DialogContent>
          <AlbumForm onSubmitSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <AlbumPhotoManager
        open={photoManagerOpen}
        onClose={() => {
          setPhotoManagerOpen(false);
          setSelectedAlbum(null);
        }}
        albumId={selectedAlbum?.id}
        onUpdate={loadAlbums}
      />
    </Box>
  );
};

export default AdminAlbums; 