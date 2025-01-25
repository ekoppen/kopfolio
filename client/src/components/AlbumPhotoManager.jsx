import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  SelectAll as SelectAllIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../utils/api';

const AlbumPhotoManager = ({ open, onClose, albumId, onUpdate }) => {
  const theme = useTheme();
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && albumId) {
      loadPhotos();
    }
  }, [open, albumId]);

  const loadPhotos = async () => {
    setLoading(true);
    setError('');
    try {
      const [allPhotosRes, albumPhotosRes] = await Promise.all([
        api.get('/photos'),
        api.get(`/photos/album/${albumId}`)
      ]);
      setPhotos(allPhotosRes.data);
      setAlbumPhotos(albumPhotosRes.data);
      setSelectedPhotos(albumPhotosRes.data.map(photo => photo.id));
    } catch (err) {
      setError('Fout bij het laden van de foto\'s');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPhotoInAlbum = (photoId) => {
    return albumPhotos.some(photo => photo.id === photoId);
  };

  const handlePhotoToggle = (photoId) => {
    const isInAlbum = isPhotoInAlbum(photoId);
    
    setSelectedPhotos(prev => {
      // Als de foto al in het album zit, moet deze geselecteerd worden voor verwijdering
      if (isInAlbum) {
        if (prev.includes(photoId)) {
          return prev.filter(id => id !== photoId);
        } else {
          return [...prev, photoId];
        }
      } 
      // Als de foto niet in het album zit, moet deze geselecteerd worden voor toevoeging
      else {
        if (prev.includes(photoId)) {
          return prev.filter(id => id !== photoId);
        } else {
          return [...prev, photoId];
        }
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(photos.map(photo => photo.id));
    }
  };

  const handleAddPhotos = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/albums/${albumId}/photos`, {
        photoIds: selectedPhotos
      });
      onUpdate?.();
      onClose();
    } catch (err) {
      setError('Fout bij het toevoegen van foto\'s aan het album');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhotos = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/albums/${albumId}/photos`, {
        data: { photoIds: selectedPhotos }
      });
      onUpdate?.();
      onClose();
    } catch (err) {
      setError('Fout bij het verwijderen van foto\'s uit het album');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh',
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
          Foto's Beheren
        </Typography>
        <Box>
          <Tooltip title={selectedPhotos.length === photos.length ? 'Deselecteer Alles' : 'Selecteer Alles'}>
            <IconButton onClick={handleSelectAll} color="primary">
              {selectedPhotos.length === photos.length ? <ClearAllIcon /> : <SelectAllIcon />}
            </IconButton>
          </Tooltip>
          <Typography 
            component="span" 
            sx={{ 
              ml: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.875rem'
            }}
          >
            {selectedPhotos.length} geselecteerd
          </Typography>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2
            }}
          >
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'transparent',
            borderRadius: 2,
            p: 2
          }}
        >
          <Grid container spacing={2}>
            {photos.map((photo) => {
              const isInAlbum = isPhotoInAlbum(photo.id);
              const isSelected = selectedPhotos.includes(photo.id);

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                  <Card 
                    sx={{ 
                      position: 'relative',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: theme.shadows[8]
                      },
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                      minWidth: 200,
                      maxWidth: 400,
                      width: '100%',
                      mx: 'auto'
                    }}
                    onClick={() => handlePhotoToggle(photo.id)}
                  >
                    <CardMedia
                      component="img"
                      sx={{ 
                        aspectRatio: '4/3',
                        objectFit: 'cover',
                        filter: isSelected ? 'brightness(0.9)' : 'none'
                      }}
                      image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumbs/thumb_${photo.filename}`}
                      alt={photo.title || 'Foto'}
                    />
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoToggle(photo.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          color: isSelected ? 'primary.main' : 'action.disabled',
                          bgcolor: 'white',
                          borderRadius: '50%'
                        }}
                      />
                    </Box>
                    {isInAlbum && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                          In Album
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Annuleren
        </Button>
        <Button
          onClick={async () => {
            // Bepaal welke foto's toegevoegd/verwijderd moeten worden
            const photosToAdd = selectedPhotos.filter(id => !isPhotoInAlbum(id));
            const photosToRemove = albumPhotos
              .map(photo => photo.id)
              .filter(id => !selectedPhotos.includes(id));

            setLoading(true);
            setError('');
            try {
              // Voer de nodige acties uit
              if (photosToAdd.length > 0) {
                await api.post(`/albums/${albumId}/photos`, {
                  photoIds: photosToAdd
                });
              }
              if (photosToRemove.length > 0) {
                await api.delete(`/albums/${albumId}/photos`, {
                  data: { photoIds: photosToRemove }
                });
              }
              onUpdate?.();
              onClose();
            } catch (err) {
              setError('Fout bij het opslaan van de wijzigingen');
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Opslaan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlbumPhotoManager; 