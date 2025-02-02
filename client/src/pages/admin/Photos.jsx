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
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  TextField,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  GridView as GridViewIcon, 
  List as ListViewIcon, 
  ViewList as DetailedListIcon, 
  ZoomIn as ZoomInIcon, 
  ArrowUpward as ArrowUpIcon, 
  ArrowDownward as ArrowDownIcon,
  Photo as PhotoIcon,
  Save as SaveIcon 
} from '@mui/icons-material';
import PhotoUpload from '../../components/PhotoUpload';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

// Utility functies
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '-';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatExifValue = (value) => {
  if (value === null || value === undefined) return '-';
  return value;
};

const AdminPhotos = () => {
  const theme = useTheme();
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [view, setView] = useState(() => {
    return localStorage.getItem('photoView') || 'grid';
  });
  const [gridSize, setGridSize] = useState(() => {
    return parseInt(localStorage.getItem('photoGridSize')) || 3;
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const { showToast } = useToast();
  const [albums, setAlbums] = useState([]);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [albumMenuAnchor, setAlbumMenuAnchor] = useState(null);
  const [selectedPhotoForAlbum, setSelectedPhotoForAlbum] = useState(null);
  const [newAlbumDialogOpen, setNewAlbumDialogOpen] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  const loadPhotos = async () => {
    try {
      const response = await api.get('/photos?include=albums');
      setPhotos(response.data);
    } catch (error) {
      showToast('Fout bij ophalen foto\'s', 'error');
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await api.get('/albums');
      setAlbums(response.data);
    } catch (error) {
      showToast('Fout bij ophalen albums', 'error');
    }
  };

  useEffect(() => {
    loadPhotos();
    loadAlbums();
  }, []);

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
      showToast('Foto succesvol verwijderd', 'success');
    } catch (error) {
      showToast('Fout bij verwijderen foto', 'error');
    }
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      localStorage.setItem('photoView', newView);
    }
  };

  const handleGridSizeChange = (event, newValue) => {
    setGridSize(newValue);
    localStorage.setItem('photoGridSize', newValue);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedPhotos = () => {
    const sortedPhotos = [...photos];
    sortedPhotos.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Speciale behandeling voor null/undefined waarden
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Speciale behandeling voor albums
      if (sortConfig.key === 'albums') {
        // Haal de albumnamen op en sorteer op de eerste albumnaam (of een lege string als er geen albums zijn)
        aValue = (a.albums && a.albums.length > 0) ? a.albums.map(album => album.title).join(', ').toLowerCase() : '';
        bValue = (b.albums && b.albums.length > 0) ? b.albums.map(album => album.title).join(', ').toLowerCase() : '';
      }
      // Datumvelden
      else if (['created_at', 'original_date'].includes(sortConfig.key)) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      // Bestandsgrootte
      else if (sortConfig.key === 'size') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      // Tekstvelden
      else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedPhotos;
  };

  const SortableTableCell = ({ field, label, width }) => (
    <TableCell 
      sx={{ 
        width,
        cursor: 'pointer',
        userSelect: 'none',
        py: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      onClick={() => handleSort(field)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {label}
        {sortConfig.key === field && (
          <Box component="span" sx={{ opacity: 0.5, display: 'inline-flex', alignItems: 'center' }}>
            {sortConfig.direction === 'asc' ? 
              <ArrowUpIcon fontSize="small" /> : 
              <ArrowDownIcon fontSize="small" />
            }
          </Box>
        )}
      </Box>
    </TableCell>
  );

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedPhotos(new Set(photos.map(photo => photo.id)));
    } else {
      setSelectedPhotos(new Set());
    }
  };

  const handleSelectPhoto = (photoId) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedPhotos).map(id => api.delete(`/photos/${id}`))
      );
      setPhotos(photos.filter(photo => !selectedPhotos.has(photo.id)));
      setSelectedPhotos(new Set());
      setBulkDeleteDialogOpen(false);
      showToast(`${selectedPhotos.size} foto('s) succesvol verwijderd`, 'success');
    } catch (error) {
      showToast('Fout bij verwijderen foto\'s', 'error');
    }
  };

  const handleShowDetails = (photo, event) => {
    event?.stopPropagation();
    setSelectedPhoto(photo);
  };

  const handleAssignAlbum = async (photoId, albumId) => {
    try {
      if (albumId) {
        // Voeg foto toe aan album
        await api.post(`/albums/${albumId}/photos`, {
          photoIds: [photoId]
        });
      } else {
        // Verwijder foto uit alle albums
        const photoAlbums = photos.find(p => p.id === photoId)?.albums || [];
        await Promise.all(
          photoAlbums.map(album => 
            api.delete(`/albums/${album.id}/photos`, {
              data: { photoIds: [photoId] }
            })
          )
        );
      }
      
      // Herlaad beide states
      await Promise.all([loadPhotos(), loadAlbums()]);
      showToast('Album succesvol toegewezen', 'success');
    } catch (error) {
      console.error('Error assigning album:', error);
      showToast('Fout bij toewijzen album', 'error');
    }
  };

  const handleBulkAssignAlbum = async () => {
    try {
      if (selectedAlbum) {
        // Voeg foto's toe aan album
        await api.post(`/albums/${selectedAlbum}/photos`, {
          photoIds: Array.from(selectedPhotos)
        });
      } else {
        // Verwijder geselecteerde foto's uit alle albums
        const selectedPhotosList = Array.from(selectedPhotos);
        const uniqueAlbums = new Set();
        selectedPhotosList.forEach(photoId => {
          const photo = photos.find(p => p.id === photoId);
          photo?.albums?.forEach(album => uniqueAlbums.add(album.id));
        });

        await Promise.all(
          Array.from(uniqueAlbums).map(albumId =>
            api.delete(`/albums/${albumId}/photos`, {
              data: { photoIds: selectedPhotosList }
            })
          )
        );
      }

      // Herlaad beide states
      await Promise.all([loadPhotos(), loadAlbums()]);
      setAlbumDialogOpen(false);
      setSelectedAlbum('');
      showToast(`Album succesvol toegewezen aan ${selectedPhotos.size} foto('s)`, 'success');
    } catch (error) {
      console.error('Error bulk assigning album:', error);
      showToast('Fout bij toewijzen album', 'error');
    }
  };

  const handleAlbumClick = (event, photo) => {
    event.stopPropagation();
    setSelectedPhotoForAlbum(photo);
    setAlbumMenuAnchor(event.currentTarget);
  };

  const handleAlbumMenuClose = () => {
    setAlbumMenuAnchor(null);
    setSelectedPhotoForAlbum(null);
  };

  const handleAlbumSelect = async (albumId) => {
    if (selectedPhotoForAlbum) {
      await handleAssignAlbum(selectedPhotoForAlbum.id, albumId);
    }
    handleAlbumMenuClose();
  };

  const handleCreateAlbum = async () => {
    try {
      await api.post('/albums', { title: newAlbumTitle });
      await loadAlbums();
      setNewAlbumDialogOpen(false);
      setNewAlbumTitle('');
      showToast('Album succesvol aangemaakt', 'success');
    } catch (error) {
      console.error('Error creating album:', error);
      showToast('Fout bij aanmaken album', 'error');
    }
  };

  const renderGridView = () => (
    <Grid container spacing={2}>
      {getSortedPhotos().map((photo) => (
        <Grid item xs={12} sm={6} md={12/gridSize} key={photo.id}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              position: 'relative',
              cursor: 'pointer',
              '&:hover .photo-overlay': {
                opacity: 1
              },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
            onClick={() => handleShowDetails(photo)}
          >
            <CardMedia
              component="img"
              image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumbs/thumb_${photo.filename}`}
              alt={photo.title || 'Uploaded photo'}
              sx={{ 
                aspectRatio: '4/3',
                width: '100%',
                objectFit: 'cover',
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
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
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                opacity: 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box p={2} display="flex" justifyContent="flex-end">
                <FormControl size="small" sx={{ minWidth: 120, mr: 1.5 }}>
                  <InputLabel sx={{ color: 'white' }}>Album</InputLabel>
                  <Select
                    value={photo.albums?.[0]?.id || ''}
                    label="Album"
                    onChange={(e) => handleAssignAlbum(photo.id, e.target.value || null)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ 
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '.MuiSvgIcon-root': {
                        color: 'white',
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Geen album</em>
                    </MenuItem>
                    {albums.map((album) => (
                      <MenuItem key={album.id} value={album.id}>
                        {album.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(photo);
                  }}
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Paper 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
      }}
    >
      {photos.map((photo) => (
        <Box
          key={photo.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '&:last-child': {
              borderBottom: 'none'
            },
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => handleShowDetails(photo)}
        >
          <Box
            sx={{
              position: 'relative',
              width: 200,
              height: 150,
              backgroundColor: 'background.default',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <CardMedia
              component="img"
              image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumbs/thumb_${photo.filename}`}
              alt={photo.title || 'Uploaded photo'}
              sx={{ 
                aspectRatio: '4/3',
                width: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="subtitle1">
              {photo.title || photo.filename}
            </Typography>
            {photo.description && (
              <Typography variant="body2" color="text.secondary">
                {photo.description}
              </Typography>
            )}
          </Box>
          <Box>
            <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel>Album</InputLabel>
              <Select
                value={photo.albums?.[0]?.id || ''}
                label="Album"
                onChange={(e) => handleAssignAlbum(photo.id, e.target.value || null)}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem value="">
                  <em>Geen album</em>
                </MenuItem>
                {albums.map((album) => (
                  <MenuItem key={album.id} value={album.id}>
                    {album.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(photo);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Paper>
  );

  const renderDetailedListView = () => (
    <Paper 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedPhotos.size > 0 && selectedPhotos.size < photos.length}
                  checked={selectedPhotos.size === photos.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ width: 100 }}>Thumbnail</TableCell>
              <SortableTableCell field="display_name" label="Naam" />
              <SortableTableCell field="exif_data.model" label="Camera Model" />
              <SortableTableCell field="albums" label="Album" width={300} />
              <SortableTableCell field="size" label="Grootte" width={100} />
              <SortableTableCell field="created_at" label="Geüpload op" width={150} />
              <SortableTableCell field="original_date" label="Originele datum" width={150} />
              <TableCell align="right" sx={{ width: 120 }}>Acties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedPhotos().map((photo) => (
              <TableRow 
                key={photo.id} 
                hover
                selected={selectedPhotos.has(photo.id)}
                onClick={() => handleShowDetails(photo)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedPhotos.has(photo.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectPhoto(photo.id);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      overflow: 'hidden',
                      backgroundColor: 'background.default'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumbs/thumb_${photo.filename}`}
                      alt={photo.title || 'Uploaded photo'}
                      sx={{ 
                        aspectRatio: '4/3',
                        width: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>{photo.title || photo.original_filename}</TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {photo.exif_data?.model || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {photo.albums?.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: 300 }}>
                      {photo.albums.map(album => (
                        <Chip 
                          key={album.id}
                          label={album.title}
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlbumClick(e, photo);
                          }}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Button 
                      size="small" 
                      variant="text" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAlbumClick(e, photo);
                      }}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      Album toewijzen
                    </Button>
                  )}
                </TableCell>
                <TableCell>{formatFileSize(photo.size)}</TableCell>
                <TableCell>{formatDate(photo.created_at)}</TableCell>
                <TableCell>{formatDate(photo.original_date)}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(photo);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Menu
        anchorEl={albumMenuAnchor}
        open={Boolean(albumMenuAnchor)}
        onClose={handleAlbumMenuClose}
      >
        <MenuItem onClick={() => handleAlbumSelect(null)}>
          <em>Geen album</em>
        </MenuItem>
        <Divider />
        {albums.map((album) => (
          <MenuItem 
            key={album.id} 
            onClick={() => handleAlbumSelect(album.id)}
            selected={selectedPhotoForAlbum?.album_id === album.id}
          >
            {album.title}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
      >
        <DialogTitle>Foto's verwijderen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Weet je zeker dat je {selectedPhotos.size} foto('s) wilt verwijderen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleBulkDelete} color="error" variant="contained">
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={albumDialogOpen}
        onClose={() => setAlbumDialogOpen(false)}
      >
        <DialogTitle>Album toewijzen</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Selecteer een album om toe te wijzen aan {selectedPhotos.size} foto('s)
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Album</InputLabel>
            <Select
              value={selectedAlbum}
              label="Album"
              onChange={(e) => setSelectedAlbum(e.target.value)}
            >
              <MenuItem value="">
                <em>Geen album</em>
              </MenuItem>
              {albums.map((album) => (
                <MenuItem key={album.id} value={album.id}>
                  {album.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            onClick={() => setNewAlbumDialogOpen(true)}
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            fullWidth
          >
            Nieuw album
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlbumDialogOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleBulkAssignAlbum} variant="contained">
            Toewijzen
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={newAlbumDialogOpen}
        onClose={() => setNewAlbumDialogOpen(false)}
      >
        <DialogTitle>Nieuw album</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Voer een titel in voor het nieuwe album
          </DialogContentText>
          <TextField
            autoFocus
            label="Titel"
            fullWidth
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewAlbumDialogOpen(false)}>
            Annuleren
          </Button>
          <Button 
            onClick={handleCreateAlbum} 
            variant="contained"
            disabled={!newAlbumTitle.trim()}
          >
            Aanmaken
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );

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
            {photos.length} foto('s)
            {selectedPhotos.size > 0 && ` • ${selectedPhotos.size} geselecteerd`}
          </Typography>
          {selectedPhotos.size > 0 ? (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setAlbumDialogOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Album toewijzen
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setBulkDeleteDialogOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Verwijderen
              </Button>
            </>
          ) : (
            <>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListViewIcon />
                </ToggleButton>
                <ToggleButton value="detailed">
                  <DetailedListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              {view === 'grid' && (
                <Box sx={{ width: 120 }}>
                  <Slider
                    value={gridSize}
                    min={2}
                    max={4}
                    step={1}
                    onChange={handleGridSizeChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => {
                      const containerWidth = 1200;
                      const spacing = 16;
                      const columns = value;
                      const imageWidth = Math.floor((containerWidth - (spacing * (columns + 1))) / columns);
                      return `${imageWidth}px`;
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
        <PhotoUpload onUploadComplete={loadPhotos} />
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Linker kolom met foto's */}
        <Box sx={{ flex: 1 }}>
          {view === 'grid' ? renderGridView() : 
           view === 'list' ? renderListView() : 
           renderDetailedListView()}
        </Box>

        {/* Rechter kolom met details */}
        <Paper 
          elevation={0}
          sx={{ 
            width: 300, 
            p: 2,
            alignSelf: 'flex-start',
            position: 'sticky',
            top: 24,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          }}
        >
          {selectedPhoto ? (
            <>
              <Box sx={{ mb: 2 }}>
                <img
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumbs/thumb_${selectedPhoto.filename}`}
                  alt={selectedPhoto.title || 'Geselecteerde foto'}
                  style={{ 
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
              </Box>

              <List disablePadding>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Naam
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        value={selectedPhoto.title || ''}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setSelectedPhoto(prev => ({ ...prev, title: newTitle }));
                        }}
                        placeholder={selectedPhoto.original_filename}
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={async () => {
                          try {
                            await api.put(`/photos/${selectedPhoto.id}`, { 
                              title: selectedPhoto.title 
                            });
                            showToast('Naam succesvol opgeslagen', 'success');
                            setPhotos(prev => prev.map(p => 
                              p.id === selectedPhoto.id 
                                ? { ...p, title: selectedPhoto.title }
                                : p
                            ));
                          } catch (error) {
                            console.error('Error saving title:', error);
                            showToast('Fout bij opslaan naam', 'error');
                          }
                        }}
                        color="primary"
                      >
                        <SaveIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Album
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selectedPhoto.albums?.length > 0 ? (
                        selectedPhoto.albums.map(album => (
                          <Chip 
                            key={album.id}
                            label={album.title}
                            size="small"
                            variant="outlined"
                            onClick={(e) => handleAlbumClick(e, selectedPhoto)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'action.hover'
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Button 
                          size="small" 
                          variant="text" 
                          onClick={(e) => handleAlbumClick(e, selectedPhoto)}
                          sx={{ 
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          Album toewijzen
                        </Button>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Bestandsgrootte
                    </Typography>
                    <ListItemText 
                      primary={formatFileSize(selectedPhoto.size)} 
                    />
                  </Box>
                </ListItem>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Geüpload op
                    </Typography>
                    <ListItemText 
                      primary={formatDate(selectedPhoto.created_at)} 
                    />
                  </Box>
                </ListItem>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Originele datum
                    </Typography>
                    <ListItemText 
                      primary={formatDate(selectedPhoto.original_date)} 
                    />
                  </Box>
                </ListItem>
              </List>

              {selectedPhoto.exif_data && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Camera Informatie
                  </Typography>
                  <List disablePadding>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Camera
                        </Typography>
                        <ListItemText 
                          primary={formatExifValue(selectedPhoto.exif_data.make)} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Model
                        </Typography>
                        <ListItemText 
                          primary={formatExifValue(selectedPhoto.exif_data.model)} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Software
                        </Typography>
                        <ListItemText 
                          primary={formatExifValue(selectedPhoto.exif_data.software)} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Sluitertijd
                        </Typography>
                        <ListItemText 
                          primary={formatExifValue(selectedPhoto.exif_data.exposureTime)} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Diafragma
                        </Typography>
                        <ListItemText 
                          primary={formatExifValue(selectedPhoto.exif_data.fNumber)} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          ISO
                        </Typography>
                        <ListItemText 
                          primary={formatExifValue(selectedPhoto.exif_data.iso)} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Brandpuntsafstand
                        </Typography>
                        <ListItemText 
                          primary={formatExifValue(selectedPhoto.exif_data.focalLength)} 
                        />
                      </Box>
                    </ListItem>
                  </List>

                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Afbeelding Informatie
                  </Typography>
                  <List disablePadding>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Afmetingen
                        </Typography>
                        <ListItemText 
                          primary={`${selectedPhoto.exif_data.width} × ${selectedPhoto.exif_data.height} pixels`} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Formaat
                        </Typography>
                        <ListItemText 
                          primary={selectedPhoto.exif_data.format?.toUpperCase()} 
                        />
                      </Box>
                    </ListItem>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Kleurruimte
                        </Typography>
                        <ListItemText 
                          primary={selectedPhoto.exif_data.space} 
                        />
                      </Box>
                    </ListItem>
                  </List>
                </>
              )}
            </>
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              py: 4
            }}>
              <PhotoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                Selecteer een foto om de details te bekijken
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Foto verwijderen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Weet je zeker dat je deze foto wilt verwijderen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuleren</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPhotos; 