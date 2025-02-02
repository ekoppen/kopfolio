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
  Typography,
  Box,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  SelectAll as SelectAllIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

// SortablePhoto component
const SortablePhoto = ({ photo, isSelected, isCover, onToggle, onContextMenu }) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <div ref={setNodeRef} style={style}>
        <Card 
          sx={{ 
            position: 'relative',
            transition: 'all 0.2s',
            transform: isSelected ? 'scale(0.98)' : 'scale(1)',
            cursor: 'pointer',
            '&:hover': {
              transform: isDragging ? 'scale(1.05)' : 'scale(1.02)',
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
          onClick={() => onToggle(photo.id)}
          onContextMenu={(e) => onContextMenu(e, photo)}
        >
          <Box 
            {...attributes}
            {...listeners}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1,
              cursor: 'grab',
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }}
          >
            <DragIcon />
          </Box>
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
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 1
            }}
          >
            {isCover && (
              <Tooltip title="Cover foto">
                <StarIcon 
                  sx={{ 
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                  }} 
                />
              </Tooltip>
            )}
            <CheckCircleIcon
              sx={{
                color: isSelected ? 'primary.main' : 'action.disabled',
                bgcolor: 'white',
                borderRadius: '50%'
              }}
            />
          </Box>
        </Card>
      </div>
    </Grid>
  );
};

const AlbumPhotoManager = ({ open, onClose, albumId, onUpdate }) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverPhotoId, setCoverPhotoId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedPhotoForMenu, setSelectedPhotoForMenu] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open && albumId) {
      loadPhotos();
    }
  }, [open, albumId]);

  const loadPhotos = async () => {
    setLoading(true);
    setError('');
    try {
      const [allPhotosRes, albumPhotosRes, albumRes] = await Promise.all([
        api.get('/photos'),
        api.get(`/photos/album/${albumId}`),
        api.get(`/albums/${albumId}`)
      ]);
      setPhotos(allPhotosRes.data);
      setAlbumPhotos(albumPhotosRes.data);
      setSelectedPhotos(albumPhotosRes.data.map(photo => photo.id));
      setCoverPhotoId(albumRes.data.cover_photo_id);
    } catch (err) {
      setError('Fout bij het laden van de foto\'s');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setAlbumPhotos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update de volgorde op de server
        api.put(`/albums/${albumId}/order`, {
          photoOrder: newItems.map(photo => photo.id)
        })
        .then(() => {
          showToast('Foto volgorde succesvol bijgewerkt', 'success');
          onUpdate?.();
        })
        .catch((error) => {
          console.error('Error updating photo order:', error);
          showToast('Fout bij updaten foto volgorde', 'error');
          loadPhotos(); // Herstel de originele volgorde
        });

        return newItems;
      });
    }
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

  const handleContextMenu = (event, photo) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
    setSelectedPhotoForMenu(photo);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedPhotoForMenu(null);
  };

  const handleSetCover = async () => {
    if (!selectedPhotoForMenu) return;

    try {
      await api.put(`/albums/${albumId}/cover`, {
        photoId: selectedPhotoForMenu.id
      });
      setCoverPhotoId(selectedPhotoForMenu.id);
      showToast('Cover foto succesvol bijgewerkt', 'success');
      onUpdate?.();
    } catch (error) {
      console.error('Error setting cover photo:', error);
      showToast('Fout bij instellen cover foto', 'error');
    }
    handleCloseContextMenu();
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
      
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider'
      }} />
      
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={albumPhotos.map(p => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              <Grid container spacing={2}>
                {albumPhotos.map((photo) => (
                  <SortablePhoto
                    key={photo.id}
                    photo={photo}
                    isSelected={selectedPhotos.includes(photo.id)}
                    isCover={photo.id === coverPhotoId}
                    onToggle={handlePhotoToggle}
                    onContextMenu={handleContextMenu}
                  />
                ))}
              </Grid>
            </SortableContext>
          </DndContext>
        </Paper>
      </DialogContent>

      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.y, left: contextMenu.x }
            : undefined
        }
      >
        <MenuItem onClick={handleSetCover}>
          Als cover instellen
        </MenuItem>
      </Menu>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Sluiten
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlbumPhotoManager; 