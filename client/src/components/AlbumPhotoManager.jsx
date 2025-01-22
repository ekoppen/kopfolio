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
      setSelectedPhotos([]);
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
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else {
        return [...prev, photoId];
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
          minHeight: '80vh'
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
            bgcolor: 'grey.50',
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
                      border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none'
                    }}
                    onClick={() => handlePhotoToggle(photo.id)}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${photo.filename}`}
                      alt={photo.title || 'Foto'}
                      sx={{ 
                        objectFit: 'cover',
                        filter: isSelected ? 'brightness(0.9)' : 'none'
                      }}
                    />
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'primary.main',
                          bgcolor: 'white',
                          borderRadius: '50%'
                        }}
                      />
                    )}
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
          onClick={handleRemovePhotos}
          color="error"
          variant="outlined"
          disabled={loading || selectedPhotos.length === 0}
          sx={{ borderRadius: 2 }}
        >
          Verwijderen uit Album
        </Button>
        <Button
          onClick={handleAddPhotos}
          variant="contained"
          disabled={loading || selectedPhotos.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <AddPhotoIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          Toevoegen aan Album
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlbumPhotoManager; 