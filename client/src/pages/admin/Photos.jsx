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
  TableCell
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, GridView as GridViewIcon, List as ListViewIcon, ViewList as DetailedListIcon, ZoomIn as ZoomInIcon, ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon } from '@mui/icons-material';
import PhotoUpload from '../../components/PhotoUpload';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const AdminPhotos = () => {
  const theme = useTheme();
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [gridSize, setGridSize] = useState(3); // Aantal kolommen: 12 / gridSize
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  const { showToast } = useToast();

  const loadPhotos = async () => {
    try {
      const response = await api.get('/photos');
      setPhotos(response.data);
    } catch (error) {
      showToast('Fout bij ophalen foto\'s', 'error');
    }
  };

  useEffect(() => {
    loadPhotos();
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

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
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
                <IconButton size="small" sx={{ color: 'white', mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ color: 'white' }}
                  onClick={() => handleDeleteClick(photo)}
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
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 100 }}>Thumbnail</TableCell>
              <SortableTableCell field="filename" label="Bestandsnaam" />
              <SortableTableCell field="title" label="Titel" />
              <SortableTableCell field="description" label="Beschrijving" />
              <SortableTableCell field="size" label="Grootte" width={100} />
              <SortableTableCell field="created_at" label="Geüpload op" width={150} />
              <SortableTableCell field="original_date" label="Originele datum" width={150} />
              <TableCell align="right" sx={{ width: 100 }}>Acties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedPhotos().map((photo) => (
              <TableRow key={photo.id} hover>
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
                <TableCell>{formatFileSize(photo.size)}</TableCell>
                <TableCell>{formatDate(photo.created_at)}</TableCell>
                <TableCell>{formatDate(photo.original_date)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => handleDeleteClick(photo)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
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
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
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

        {viewMode === 'grid' && (
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

      {viewMode === 'grid' ? renderGridView() : 
       viewMode === 'list' ? renderListView() : 
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
    </Box>
  );
};

export default AdminPhotos; 