import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
  Divider,
  Paper,
  AppBar,
  Toolbar,
  TextField,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Slider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DragIndicator as DragIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Collections as SlideshowIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Height as SpacerIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import { useTheme } from '@mui/material/styles';

// Rich text editor configuratie
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'size',
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'align',
  'link'
];

const getImageWidth = (size) => {
  switch (size) {
    case 'small': return '25%';
    case 'medium': return '50%';
    case 'large': return '75%';
    case 'full': return '100%';
    default: return '50%';
  }
};

const getShadowStyle = (showShadow) => showShadow ? {
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
  }
} : {};

const ImageEditor = forwardRef(({ image, selectedBlock, updateBlock }, ref) => {
  const [localTitle, setLocalTitle] = useState(image.title || '');
  const [localDescription, setLocalDescription] = useState(image.description || '');
  const [localShowTitle, setLocalShowTitle] = useState(image.showTitle || false);
  const [localShowShadow, setLocalShowShadow] = useState(image.showShadow || false);

  useImperativeHandle(ref, () => ({
    handleSave: () => {
      const updatedImage = { 
        ...image, 
        title: localTitle,
        description: localDescription,
        showTitle: localShowTitle,
        showShadow: localShowShadow
      };
      updateBlock(selectedBlock.id, { 
        content: selectedBlock.type === 'image' ? updatedImage : selectedBlock.content.map(p => p.id === image.id ? updatedImage : p)
      });
    }
  }));

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box
          component="img"
          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${image.filename}`}
          alt={localTitle || 'Afbeelding'}
          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            label="Titel"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            margin="dense"
            size="small"
          />
          <TextField
            fullWidth
            label="Beschrijving"
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            margin="dense"
            size="small"
            multiline
            rows={2}
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={localShowTitle}
              onChange={(e) => setLocalShowTitle(e.target.checked)}
            />
          }
          label="Toon titel en beschrijving"
        />
        <FormControlLabel
          control={
            <Switch
              checked={localShowShadow}
              onChange={(e) => setLocalShowShadow(e.target.checked)}
            />
          }
          label="Toon schaduw"
        />
      </Box>
    </Box>
  );
});

const BlockSettings = ({ block, onSettingsChange, updateBlock }) => {
  const theme = useTheme();
  const [localHeight, setLocalHeight] = useState(block.settings?.height || 32);
  const [showTitle, setShowTitle] = useState(block.content?.showTitle || false);
  const [showShadow, setShowShadow] = useState(block.content?.showShadow || false);

  useEffect(() => {
    setShowTitle(block.content?.showTitle || false);
    setShowShadow(block.content?.showShadow || false);
  }, [block]);

  const handleSpacerHeightChange = (value) => {
    const height = Math.max(8, Math.min(200, value));
    setLocalHeight(height);
    onSettingsChange({ height });
  };

  switch (block.type) {
    case 'spacer':
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Hoogte (pixels)
          </Typography>
          <Box sx={{ px: 2, py: 1 }}>
            <Slider
              value={localHeight}
              min={8}
              max={200}
              step={8}
              onChange={(e, value) => handleSpacerHeightChange(value)}
              marks={[
                { value: 8, label: '8px' },
                { value: 32, label: '32px' },
                { value: 64, label: '64px' },
                { value: 200, label: '200px' }
              ]}
              valueLabelDisplay="on"
            />
          </Box>
          <TextField
            type="number"
            label="Exacte hoogte"
            value={localHeight}
            onChange={(e) => handleSpacerHeightChange(parseInt(e.target.value) || 32)}
            inputProps={{
              min: 8,
              max: 200,
              step: 8
            }}
            size="small"
            fullWidth
            sx={{ mt: 2 }}
          />
        </Box>
      );
    case 'image':
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Formaat
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={block.settings?.size || 'medium'}
              onChange={(e) => onSettingsChange({ size: e.target.value })}
            >
              <MenuItem value="small">Klein (25%)</MenuItem>
              <MenuItem value="medium">Normaal (50%)</MenuItem>
              <MenuItem value="large">Groot (75%)</MenuItem>
              <MenuItem value="full">Volledig (100%)</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showTitle}
                onChange={(e) => {
                  setShowTitle(e.target.checked);
                  updateBlock(block.id, {
                    content: {
                      ...block.content,
                      showTitle: e.target.checked
                    }
                  });
                }}
              />
            }
            label="Toon titel en beschrijving"
          />

          <FormControlLabel
            control={
              <Switch
                checked={showShadow}
                onChange={(e) => {
                  setShowShadow(e.target.checked);
                  updateBlock(block.id, {
                    content: {
                      ...block.content,
                      showShadow: e.target.checked
                    }
                  });
                }}
              />
            }
            label="Toon schaduw"
          />
        </Box>
      );
    case 'slideshow':
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Slideshow Instellingen
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Transitie Effect
            </Typography>
            <Select
              value={block.settings?.transition || 'fade'}
              onChange={(e) => onSettingsChange({ transition: e.target.value })}
              fullWidth
              size="small"
            >
              <MenuItem value="fade">Fade</MenuItem>
              <MenuItem value="slide">Horizontaal Scrollen</MenuItem>
              <MenuItem value="creative">Creative</MenuItem>
              <MenuItem value="cards">Cards</MenuItem>
              <MenuItem value="coverflow">Coverflow</MenuItem>
            </Select>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Effect Duur (ms)
            </Typography>
            <TextField
              type="number"
              value={block.settings?.speed || 1000}
              onChange={(e) => onSettingsChange({ speed: parseInt(e.target.value) })}
              fullWidth
              size="small"
              helperText="Duur van het transitie effect in milliseconden"
              inputProps={{ min: 100, max: 5000, step: 100 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Interval (ms)
            </Typography>
            <TextField
              type="number"
              value={block.settings?.interval || 5000}
              onChange={(e) => onSettingsChange({ interval: parseInt(e.target.value) })}
              fullWidth
              size="small"
              helperText="Tijd tussen slides in milliseconden"
              inputProps={{ min: 1000, max: 10000, step: 500 }}
            />
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={block.settings?.autoPlay !== false}
                  onChange={(e) => onSettingsChange({ autoPlay: e.target.checked })}
                />
              }
              label="Automatisch afspelen"
            />
          </Box>
        </Box>
      );
    default:
      return null;
  }
};

const BlockEditor = ({ block, onChange, onDelete }) => {
  switch (block.type) {
    case 'spacer':
      return (
        <Box sx={{ 
          height: block.settings?.height || 32,
          width: '100%',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          mb: 2
        }}>
          <Typography variant="caption" color="text.secondary">
            Ruimte: {block.settings?.height || 32}px
          </Typography>
        </Box>
      );
    case 'text':
      return (
        <Box sx={{ 
          position: 'relative',
          '& .quill': {
            '& .ql-toolbar': {
              position: 'sticky',
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: 'background.paper',
              borderColor: 'transparent',
              borderRadius: 1,
              opacity: 0,
              transition: 'opacity 0.2s',
              boxShadow: 1,
              zIndex: 100,
              marginBottom: 1
            },
            '& .ql-container': {
              border: 'none',
              fontSize: '1rem',
              lineHeight: 1.75,
              '& .ql-editor': {
                padding: '1rem 0',
                minHeight: 100,
                '&:focus': {
                  outline: 'none'
                },
                '& p': {
                  marginBottom: '1rem'
                },
                '& h1, & h2, & h3': {
                  marginBottom: '1.5rem',
                  marginTop: '2rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }
              }
            },
            '&:hover .ql-toolbar': {
              opacity: 1
            }
          }
        }}>
          <ReactQuill
            theme="snow"
            value={block.content}
            onChange={(value) => onChange(block.id, { content: value })}
            modules={modules}
            formats={formats}
          />
        </Box>
      );
    case 'image':
      return (
        <Box sx={{ 
          width: getImageWidth(block.settings?.size),
          mx: 'auto'
        }}>
          {block.content ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                component="img"
                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${block.content.filename}`}
                alt={block.content.title || 'Afbeelding'}
                sx={{ 
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: block.content.showShadow ? 3 : 0
                }}
              />
              {block.content.showTitle && (
                <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                  {block.content.title && (
                    <Typography variant="h6" color="text.primary">
                      {block.content.title}
                    </Typography>
                  )}
                  {block.content.description && (
                    <Typography variant="body1" color="text.secondary">
                      {block.content.description}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Typography color="text.secondary">
                Klik op het tandwiel icoon om een afbeelding te selecteren
              </Typography>
            </Box>
          )}
        </Box>
      );
    case 'slideshow':
      return (
        <Box sx={{ 
          width: '100%',
          mx: 'auto'
        }}>
          {block.content && block.content.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box 
                sx={{ 
                  position: 'relative',
                  height: 500,
                  borderRadius: 1,
                  overflow: 'hidden',
                  ...getShadowStyle(block.settings?.showShadow)
                }}
              >
                {block.content.map((photo, photoIndex) => (
                  <Box
                    key={photo.id}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: photoIndex === 0 ? 1 : 0,
                      transition: `opacity ${block.settings?.speed || 1000}ms ease-in-out`,
                      transform: block.settings?.transition === 'creative' ? 'scale(1.2)' : 'none',
                      '&:hover': {
                        transform: block.settings?.transition === 'creative' ? 'scale(1)' : 'none',
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`}
                      alt={photo.title || `Foto ${photoIndex + 1}`}
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: `transform ${block.settings?.speed || 1000}ms ease-in-out`,
                        ...(block.settings?.transition === 'coverflow' && {
                          transform: 'perspective(1000px) rotateY(45deg)',
                          '&:hover': {
                            transform: 'perspective(1000px) rotateY(0deg)'
                          }
                        }),
                        ...(block.settings?.transition === 'cards' && {
                          transform: 'translateX(100%) scale(0.8)',
                          '&:hover': {
                            transform: 'translateX(0) scale(1)'
                          }
                        })
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Typography color="text.secondary">
                Klik op het tandwiel icoon om foto's te selecteren
              </Typography>
            </Box>
          )}
        </Box>
      );
    default:
      return null;
  }
};

const PageContentEditor = ({ initialContent = [], onChange }) => {
  const theme = useTheme();
  const [content, setContent] = useState(initialContent);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [photoSelectorOpen, setPhotoSelectorOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [blockPropertiesOpen, setBlockPropertiesOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('photos');

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (photoSelectorOpen) {
      loadPhotos();
      loadAlbums();
    }
  }, [photoSelectorOpen]);

  const loadPhotos = async () => {
    try {
      const response = await api.get('/photos');
      setPhotos(response.data);
    } catch (error) {
      console.error('Fout bij ophalen foto\'s:', error);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await api.get('/albums');
      setAlbums(response.data);
    } catch (error) {
      console.error('Fout bij ophalen albums:', error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(content);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContent(items);
    onChange(items);
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: type === 'text' ? '' : type === 'image' ? null : [],
      settings: type === 'spacer' ? { height: 32 } : {}
    };
    
    const newContent = [...content, newBlock];
    setContent(newContent);
    onChange(newContent);
    
    if (type === 'image' || type === 'slideshow') {
      setSelectedBlock(newBlock);
      setPhotoSelectorOpen(true);
    }
  };

  const updateBlock = (id, updates) => {
    const newContent = content.map(block => {
      if (block.id === id) {
        return {
          ...block,
          ...updates,
          settings: {
            ...block.settings,
            ...(updates.settings || {})
          }
        };
      }
      return block;
    });
    
    setContent(newContent);
    onChange(newContent);
  };

  const deleteBlock = (id) => {
    const newContent = content.filter(block => block.id !== id);
    setContent(newContent);
    onChange(newContent);
    setSelectedBlock(null);
  };

  const moveBlock = (id, direction) => {
    const index = content.findIndex(block => block.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === content.length - 1)
    ) return;

    const newContent = [...content];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
    
    setContent(newContent);
    onChange(newContent);
  };

  const handlePhotoSelect = (photo) => {
    if (!selectedBlock) return;

    if (selectedBlock.type === 'image') {
      updateBlock(selectedBlock.id, { content: photo });
      setPhotoSelectorOpen(false);
      setSelectedBlock(null);
    } else if (selectedBlock.type === 'slideshow') {
      const isSelected = selectedPhotos.some(p => p.id === photo.id);
      if (isSelected) {
        setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
      } else {
        setSelectedPhotos([...selectedPhotos, photo]);
      }
    }
  };

  const handleAlbumSelect = (album) => {
    if (!selectedBlock) return;

    if (selectedBlock.type === 'slideshow') {
      setSelectedPhotos(album.photos || []);
      handleSlideshowConfirm();
    } else if (selectedBlock.type === 'image' && album.photos?.length > 0) {
      handlePhotoSelect(album.photos[0]);
    }
  };

  const handleSlideshowConfirm = () => {
    if (selectedBlock && selectedBlock.type === 'slideshow') {
      updateBlock(selectedBlock.id, { content: selectedPhotos });
    }
    setPhotoSelectorOpen(false);
    setSelectedBlock(null);
    setSelectedPhotos([]);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="content">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ width: '100%' }}
            >
              {content.map((block, index) => (
                <Draggable
                  key={block.id}
                  draggableId={block.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ 
                        mb: 4,
                        position: 'relative',
                        '&:hover .block-controls': {
                          opacity: 1
                        }
                      }}
                    >
                      <Box
                        className="block-controls"
                        sx={{
                          position: 'absolute',
                          right: -50,
                          top: 0,
                          bottom: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 1,
                          gap: 0.5,
                          p: 0.5
                        }}
                      >
                        <Tooltip title="Omhoog">
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(block.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUpIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Omlaag">
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(block.id, 'down')}
                            disabled={index === content.length - 1}
                          >
                            <ArrowDownIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Instellingen">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedBlock(block);
                              setBlockPropertiesOpen(true);
                            }}
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Verwijderen">
                          <IconButton
                            size="small"
                            onClick={() => deleteBlock(block.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Box
                          {...provided.dragHandleProps}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'grab'
                          }}
                        >
                          <DragIcon />
                        </Box>
                      </Box>

                      <BlockEditor
                        block={block}
                        onChange={updateBlock}
                        onDelete={() => deleteBlock(block.id)}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Box
        sx={{
          mt: 4,
          p: 3,
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Voeg een nieuw blok toe
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TextIcon />}
            onClick={() => addBlock('text')}
          >
            Tekst
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => addBlock('image')}
          >
            Afbeelding
          </Button>
          <Button
            variant="outlined"
            startIcon={<SlideshowIcon />}
            onClick={() => addBlock('slideshow')}
          >
            Slideshow
          </Button>
          <Button
            variant="outlined"
            startIcon={<SpacerIcon />}
            onClick={() => addBlock('spacer')}
          >
            Ruimte
          </Button>
        </Box>
      </Box>

      <Dialog
        open={photoSelectorOpen}
        onClose={() => {
          setPhotoSelectorOpen(false);
          setSelectedBlock(null);
          setSelectedPhotos([]);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedBlock?.type === 'image' ? 'Selecteer een foto' : 'Selecteer foto\'s'}
        </DialogTitle>
        <DialogContent>
          {selectedBlock?.type === 'slideshow' && (
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Foto's" value="photos" />
              <Tab label="Albums" value="albums" />
            </Tabs>
          )}

          {selectedTab === 'photos' && (
            <Grid container spacing={2}>
              {photos.map((photo) => {
                const isSelected = selectedPhotos.some(p => p.id === photo.id);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                    <Card
                      onClick={() => handlePhotoSelect(photo)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                        border: isSelected ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                    >
                      <CardMedia
                        component="img"
                        height={140}
                        image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`}
                        alt={photo.title || 'Foto'}
                      />
                      {photo.title && (
                        <CardContent>
                          <Typography variant="subtitle2">
                            {photo.title}
                          </Typography>
                        </CardContent>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {selectedTab === 'albums' && (
            <Grid container spacing={2}>
              {albums.map((album) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={album.id}>
                  <Card
                    onClick={() => handleAlbumSelect(album)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <CardMedia
                      component="img"
                      height={140}
                      image={album.cover_photo ? 
                        `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${album.cover_photo}` :
                        'placeholder.jpg'
                      }
                      alt={album.title || 'Album'}
                    />
                    <CardContent>
                      <Typography variant="subtitle1">
                        {album.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {album.photo_count} foto's
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPhotoSelectorOpen(false);
              setSelectedBlock(null);
              setSelectedPhotos([]);
            }}
          >
            Annuleren
          </Button>
          {selectedBlock?.type === 'slideshow' && selectedTab === 'photos' && (
            <Button
              variant="contained"
              onClick={handleSlideshowConfirm}
              disabled={selectedPhotos.length === 0}
            >
              Bevestigen ({selectedPhotos.length} foto's)
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={blockPropertiesOpen}
        onClose={() => {
          setBlockPropertiesOpen(false);
          setSelectedBlock(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Blok instellingen
        </DialogTitle>
        <DialogContent>
          {selectedBlock && (
            <BlockSettings
              block={selectedBlock}
              onSettingsChange={(updates) => {
                updateBlock(selectedBlock.id, {
                  settings: {
                    ...selectedBlock.settings,
                    ...updates
                  }
                });
              }}
              updateBlock={updateBlock}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setBlockPropertiesOpen(false);
            setSelectedBlock(null);
          }}>
            Sluiten
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PageContentEditor; 