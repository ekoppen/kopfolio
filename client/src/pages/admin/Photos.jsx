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
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, GridView as GridViewIcon, List as ListViewIcon, ViewList as DetailedListIcon, ZoomIn as ZoomInIcon, Info as InfoIcon, ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon } from '@mui/icons-material';
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

// PhotoDetailsDialog component
const PhotoDetailsDialog = ({ photo, open, onClose }) => {
  if (!photo) return null;

  const formatExifValue = (value) => {
    if (value === null || value === undefined) return '-';
    return value;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          Foto Details
        </Box>
      </DialogTitle>

      <Divider />
      
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Foto preview */}
          <Box
            sx={{
              width: 300,
              height: 300,
              borderRadius: 2,
              overflow: 'hidden',
              flexShrink: 0,
              bgcolor: 'background.default'
            }}
          >
            <CardMedia
              component="img"
              image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${photo.filename}`}
              alt={photo.title || 'Foto'}
              sx={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          {/* Details */}
          <Box sx={{ flex: 1 }}>
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Bestandsnaam" 
                  secondary={photo.filename} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Titel" 
                  secondary={photo.title || '-'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Beschrijving" 
                  secondary={photo.description || '-'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Album" 
                  secondary={photo.album?.title || '-'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Bestandsgrootte" 
                  secondary={formatFileSize(photo.size)} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Geüpload op" 
                  secondary={formatDate(photo.created_at)} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Originele datum" 
                  secondary={formatDate(photo.original_date)} 
                />
              </ListItem>
            </List>

            {photo.exif_data && (
              <>
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Camera Informatie
                </Typography>
                <List disablePadding>
                  <ListItem>
                    <ListItemText 
                      primary="Camera" 
                      secondary={formatExifValue(photo.exif_data.make)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Model" 
                      secondary={formatExifValue(photo.exif_data.model)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Software" 
                      secondary={formatExifValue(photo.exif_data.software)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Sluitertijd" 
                      secondary={formatExifValue(photo.exif_data.exposureTime)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Diafragma" 
                      secondary={formatExifValue(photo.exif_data.fNumber)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="ISO" 
                      secondary={formatExifValue(photo.exif_data.iso)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Brandpuntsafstand" 
                      secondary={formatExifValue(photo.exif_data.focalLength)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Flash" 
                      secondary={formatExifValue(photo.exif_data.flash)} 
                    />
                  </ListItem>
                </List>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Afbeelding Informatie
                </Typography>
                <List disablePadding>
                  <ListItem>
                    <ListItemText 
                      primary="Afmetingen" 
                      secondary={`${photo.exif_data.width} × ${photo.exif_data.height} pixels`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Formaat" 
                      secondary={photo.exif_data.format?.toUpperCase()} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Kleurruimte" 
                      secondary={photo.exif_data.space} 
                    />
                  </ListItem>
                </List>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Sluiten
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminPhotos = () => {
  const theme = useTheme();
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [view, setView] = useState(() => {
    // Haal de opgeslagen weergave op uit localStorage, standaard 'grid'
    return localStorage.getItem('photoView') || 'grid';
  });
  const [gridSize, setGridSize] = useState(3); // Aantal kolommen: 12 / gridSize
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

  const loadPhotos = async () => {
    try {
      const response = await api.get('/photos');
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

      // Datumvelden
      if (['created_at', 'original_date'].includes(sortConfig.key)) {
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
    setDetailsDialogOpen(true);
  };

  const handleAssignAlbum = async (photoId, albumId) => {
    try {
      await api.put(`/photos/${photoId}`, { album_id: albumId });
      await loadPhotos(); // Herlaad foto's om de wijziging te tonen
      showToast('Album succesvol toegewezen', 'success');
    } catch (error) {
      showToast('Fout bij toewijzen album', 'error');
    }
  };

  const handleBulkAssignAlbum = async () => {
    try {
      await Promise.all(
        Array.from(selectedPhotos).map(photoId =>
          api.put(`/photos/${photoId}`, { album_id: selectedAlbum || null })
        )
      );
      await loadPhotos();
      setAlbumDialogOpen(false);
      setSelectedAlbum('');
      showToast(`Album succesvol toegewezen aan ${selectedPhotos.size} foto('s)`, 'success');
    } catch (error) {
      showToast('Fout bij toewijzen album', 'error');
    }
  };

  const renderGridView = () => (
    <Grid container spacing={2}>
      {photos.map((photo) => (
        <Grid item xs={12} sm={6} md={12/gridSize} key={photo.id}>
          <Card 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative',
              '&:hover .photo-overlay': {
                opacity: 1
              }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                minHeight: 300,
                display: 'flex'
              }}
            >
              <CardMedia
                component="img"
                image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${photo.filename}`}
                alt={photo.title || 'Uploaded photo'}
                sx={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: 'background.default'
                }}
              />
            </Box>
            <Box
              className="photo-overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <Box p={2}>
                <Typography variant="subtitle1" color="white">
                  {photo.title || photo.filename}
                </Typography>
                {photo.description && (
                  <Typography variant="body2" color="white">
                    {photo.description}
                  </Typography>
                )}
              </Box>
              <Box p={1} display="flex" justifyContent="flex-end">
                <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                  <InputLabel>Album</InputLabel>
                  <Select
                    value={photo.album_id || ''}
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
                  sx={{ color: 'white', mr: 1 }}
                  onClick={(e) => handleShowDetails(photo, e)}
                >
                  <InfoIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: 'white', mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(photo);
                  }}
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
    <Paper elevation={0}>
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
            }
          }}
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
              image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${photo.filename}`}
              alt={photo.title || 'Uploaded photo'}
              sx={{ 
                width: '100%',
                height: '100%',
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
                value={photo.album_id || ''}
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
              sx={{ mr: 1 }}
              onClick={(e) => handleShowDetails(photo, e)}
            >
              <InfoIcon />
            </IconButton>
            <IconButton size="small" sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small"
              onClick={() => handleDeleteClick(photo)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Paper>
  );

  const renderDetailedListView = () => (
    <Paper elevation={0}>
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        {selectedPhotos.size > 0 && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography>
              {selectedPhotos.size} foto('s) geselecteerd
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setBulkDeleteDialogOpen(true)}
              startIcon={<DeleteIcon />}
            >
              Verwijderen
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setAlbumDialogOpen(true)}
            >
              Album toewijzen
            </Button>
          </Box>
        )}
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
              <SortableTableCell field="filename" label="Bestandsnaam" />
              <SortableTableCell field="title" label="Titel" />
              <SortableTableCell field="description" label="Beschrijving" />
              <SortableTableCell field="album_id" label="Album" />
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
                onClick={() => handleSelectPhoto(photo.id)}
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
                      image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${photo.filename}`}
                      alt={photo.title || 'Uploaded photo'}
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>{photo.filename}</TableCell>
                <TableCell>{photo.title || '-'}</TableCell>
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
                    {photo.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {photo.album_id ? (
                    <Chip 
                      label={photo.album?.title || `Album ${photo.album_id}`}
                      size="small"
                      variant="outlined"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>{formatFileSize(photo.size)}</TableCell>
                <TableCell>{formatDate(photo.created_at)}</TableCell>
                <TableCell>{formatDate(photo.original_date)}</TableCell>
                <TableCell align="right">
                  <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                    <InputLabel>Album</InputLabel>
                    <Select
                      value={photo.album_id || ''}
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
                    sx={{ mr: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDetails(photo, e);
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ mr: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // handleEditClick(photo);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
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
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Foto's beheren
        </Typography>
        <PhotoUpload onUploadSuccess={loadPhotos} />
      </Paper>

      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="grid">
            <Tooltip title="Grid weergave">
              <GridViewIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="list">
            <Tooltip title="Lijst weergave">
              <ListViewIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="detailed">
            <Tooltip title="Gedetailleerde weergave">
              <DetailedListIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {view === 'grid' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 200 }}>
            <ZoomInIcon sx={{ color: 'text.secondary' }} />
            <Slider
              value={gridSize}
              min={2}
              max={6}
              step={1}
              onChange={handleGridSizeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${12/value} kolommen`}
            />
          </Box>
        )}
      </Paper>

      {view === 'grid' ? renderGridView() : 
       view === 'list' ? renderListView() : 
       renderDetailedListView()}

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

      <PhotoDetailsDialog
        photo={selectedPhoto}
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedPhoto(null);
        }}
      />
    </Box>
  );
};

export default AdminPhotos; 