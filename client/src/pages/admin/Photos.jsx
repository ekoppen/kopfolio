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
  DialogContentText,
  DialogActions,
  Paper,
  IconButton,
  useTheme
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import PhotoUpload from '../../components/PhotoUpload';
import api from '../../utils/api';

const AdminPhotos = () => {
  const theme = useTheme();
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadPhotos = async () => {
    try {
      const response = await api.get('/photos');
      setPhotos(response.data);
    } catch (error) {
      console.error('Fout bij ophalen foto\'s:', error);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleUploadComplete = (photo) => {
    loadPhotos();
  };

  const handleDeleteClick = (photo) => {
    setSelectedPhoto(photo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/photos/${selectedPhoto.id}`);
      setPhotos(photos.filter(p => p.id !== selectedPhoto.id));
      setDeleteDialogOpen(false);
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Fout bij verwijderen foto:', error);
    }
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'medium' }}>
          Foto's Beheren
        </Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <PhotoUpload onUploadComplete={handleUploadComplete} />
      </Box>

      <Grid container spacing={2}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
            <Card 
              sx={{ 
                position: 'relative',
                height: 280,
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  '& .photo-overlay': {
                    opacity: 1
                  }
                }
              }}
            >
              <CardMedia
                component="img"
                height="100%"
                image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${photo.filename}`}
                alt={photo.title || 'Foto'}
                sx={{ 
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box
                className="photo-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                    {photo.title || 'Geen titel'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {photo.description || 'Geen beschrijving'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  justifyContent: 'flex-end'
                }}>
                  <IconButton
                    size="small"
                    onClick={() => console.log('Edit photo:', photo.id)}
                    sx={{ 
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(photo)}
                    sx={{ 
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
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
        <DialogTitle>Foto verwijderen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Weet je zeker dat je deze foto wilt verwijderen?
          </DialogContentText>
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
    </Box>
  );
};

export default AdminPhotos; 