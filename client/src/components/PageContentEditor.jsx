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
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Slideshow as SlideshowIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
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
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'align',
  'link'
];

const DRAWER_WIDTH = 300;

const getSliderSettings = (settings = {}) => ({
  dots: true,
  infinite: true,
  speed: settings.speed === 'slow' ? 1000 : settings.speed === 'fast' ? 300 : 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: settings.speed === 'slow' ? 8000 : settings.speed === 'fast' ? 3000 : 5000,
  fade: settings.transition === 'fade',
  cssEase: settings.transition === 'zoom' ? 'cubic-bezier(0.87, 0, 0.13, 1)' : 'linear',
});

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

const PageContentEditor = ({ initialContent = [], onChange, onSave, onCancel }) => {
  const [content, setContent] = useState(initialContent);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [photoSelectorOpen, setPhotoSelectorOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [blockPropertiesOpen, setBlockPropertiesOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('photos');
  const theme = useTheme();
  const imageEditorRefs = useRef({});

  // Update content wanneer initialContent verandert
  useEffect(() => {
    console.log('Initial content gewijzigd:', initialContent);
    setContent(initialContent);
  }, [initialContent]);

  // Laad foto's en albums wanneer de selector geopend wordt
  useEffect(() => {
    if (photoSelectorOpen) {
      loadPhotos();
      loadAlbums();
    }
  }, [photoSelectorOpen]);

  const loadPhotos = async () => {
    try {
      const response = await api.get('/photos');
      console.log('Geladen foto\'s:', response.data);
      setPhotos(response.data);
    } catch (error) {
      console.error('Fout bij ophalen foto\'s:', error);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await api.get('/albums');
      console.log('Geladen albums:', response.data);
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
      content: type === 'text' ? '' : type === 'image' ? null : []
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
    const newBlocks = [...content];
    const blockIndex = newBlocks.findIndex(block => block.id === id);
    if (blockIndex !== -1) {
      newBlocks[blockIndex] = {
        ...newBlocks[blockIndex],
        ...updates
      };
      setContent(newBlocks);
      onChange(newBlocks);
    }
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

  const renderBlock = (block, index) => {
    switch (block.type) {
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
              onChange={(value) => updateBlock(block.id, { content: value })}
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
            width: getImageWidth(block.settings?.size),
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
                    ...getShadowStyle(block.settings?.showShadow),
                    '& .slick-slider': {
                      height: '100%',
                    },
                    '& .slick-list, & .slick-track': {
                      height: '100%',
                    },
                    '& .slick-slide > div': {
                      height: '100%',
                    },
                    '& .slick-dots': {
                      bottom: 16,
                      '& li button:before': {
                        color: 'white',
                        opacity: 0.5,
                      },
                      '& li.slick-active button:before': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Slider {...getSliderSettings(block.settings)}>
                    {block.content.map((photo, photoIndex) => (
                      <Box
                        key={photo.id}
                        sx={{
                          height: '100%',
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
                            ...(block.settings?.transition === 'zoom' && {
                              transform: 'scale(1.1)',
                              transition: 'transform 6s ease-in-out',
                              '.slick-active &': {
                                transform: 'scale(1)',
                              },
                            }),
                          }}
                        />
                      </Box>
                    ))}
                  </Slider>
                </Box>
                {block.settings?.showTitles && block.content.map((photo, index) => (
                  photo.title && (
                    <Box key={photo.id} sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="text.primary">
                        {photo.title}
                      </Typography>
                      {photo.description && (
                        <Typography variant="body1" color="text.secondary">
                          {photo.description}
                        </Typography>
                      )}
                    </Box>
                  )
                ))}
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

  const renderBlockProperties = () => {
    if (!selectedBlock) return null;

    const imageContent = selectedBlock.type === 'image' 
      ? (Array.isArray(selectedBlock.content) 
          ? selectedBlock.content 
          : selectedBlock.content 
            ? [selectedBlock.content] 
            : [])
      : [];

    return (
      <Dialog
        open={blockPropertiesOpen}
        onClose={() => setBlockPropertiesOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            zIndex: 9999
          }
        }}
      >
        <DialogTitle>
          {selectedBlock.type === 'image' ? 'Afbeelding Eigenschappen' : 'Slideshow Eigenschappen'}
        </DialogTitle>
        <DialogContent>
          {selectedBlock.type === 'image' && imageContent.length > 0 && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Formaat</InputLabel>
                <Select
                  value={selectedBlock.settings?.size || 'medium'}
                  onChange={(e) => updateBlock(selectedBlock.id, {
                    settings: {
                      ...selectedBlock.settings,
                      size: e.target.value
                    }
                  })}
                >
                  <MenuItem value="small">Klein (25%)</MenuItem>
                  <MenuItem value="medium">Normaal (50%)</MenuItem>
                  <MenuItem value="large">Groot (75%)</MenuItem>
                  <MenuItem value="full">Volledig (100%)</MenuItem>
                </Select>
              </FormControl>

              {imageContent.map((image, index) => (
                <ImageEditor
                  key={image.id || index}
                  ref={ref => imageEditorRefs.current[image.id] = ref}
                  image={image}
                  selectedBlock={selectedBlock}
                  updateBlock={updateBlock}
                />
              ))}
            </>
          )}

          {selectedBlock.type === 'slideshow' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Formaat</InputLabel>
                <Select
                  value={selectedBlock.settings?.size || 'medium'}
                  onChange={(e) => updateBlock(selectedBlock.id, {
                    settings: {
                      ...selectedBlock.settings,
                      size: e.target.value
                    }
                  })}
                >
                  <MenuItem value="small">Klein (25%)</MenuItem>
                  <MenuItem value="medium">Normaal (50%)</MenuItem>
                  <MenuItem value="large">Groot (75%)</MenuItem>
                  <MenuItem value="full">Volledig (100%)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Transitie Effect</InputLabel>
                <Select
                  value={selectedBlock.settings?.transition || 'fade'}
                  onChange={(e) => updateBlock(selectedBlock.id, {
                    settings: {
                      ...selectedBlock.settings,
                      transition: e.target.value
                    }
                  })}
                >
                  <MenuItem value="fade">Fade</MenuItem>
                  <MenuItem value="slide">Slide</MenuItem>
                  <MenuItem value="zoom">Zoom</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Snelheid</InputLabel>
                <Select
                  value={selectedBlock.settings?.speed || 'normal'}
                  onChange={(e) => updateBlock(selectedBlock.id, {
                    settings: {
                      ...selectedBlock.settings,
                      speed: e.target.value
                    }
                  })}
                >
                  <MenuItem value="slow">Langzaam (8s)</MenuItem>
                  <MenuItem value="normal">Normaal (5s)</MenuItem>
                  <MenuItem value="fast">Snel (3s)</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedBlock.settings?.showTitles || false}
                    onChange={(e) => updateBlock(selectedBlock.id, {
                      settings: {
                        ...selectedBlock.settings,
                        showTitles: e.target.checked
                      }
                    })}
                  />
                }
                label="Toon titels en beschrijvingen"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedBlock.settings?.showShadow || false}
                    onChange={(e) => updateBlock(selectedBlock.id, {
                      settings: {
                        ...selectedBlock.settings,
                        showShadow: e.target.checked
                      }
                    })}
                  />
                }
                label="Toon schaduw"
              />
            </>
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setPhotoSelectorOpen(true);
              if (selectedBlock.type === 'slideshow' && selectedBlock.content) {
                setSelectedPhotos(Array.isArray(selectedBlock.content) ? selectedBlock.content : []);
              }
              setBlockPropertiesOpen(false);
            }}
            sx={{ mt: 2 }}
          >
            {selectedBlock.type === 'image' ? 'Afbeeldingen Beheren' : 'Slideshow Foto\'s Beheren'}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockPropertiesOpen(false)}>Annuleren</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              Object.values(imageEditorRefs.current).forEach(ref => {
                if (ref) {
                  ref.handleSave();
                }
              });
              setBlockPropertiesOpen(false);
            }}
          >
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Card
      elevation={0}
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        borderRadius: 1,
        width: '100%',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        width: '100%',
        p: 2
      }}>
        {/* Content Blocks */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="content">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}
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
                          mb: 3,
                          position: 'relative',
                          '&:hover .block-controls': {
                            opacity: 1
                          }
                        }}
                      >
                        {/* Block Controls */}
                        <Box
                          className="block-controls"
                          sx={{
                            position: 'absolute',
                            right: -50,
                            top: 8,
                            zIndex: 9999,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            p: 0.5,
                            transform: 'translateX(-100%)',
                            ml: -1
                          }}
                        >
                          <Tooltip title="Omhoog" placement="left">
                            <IconButton
                              size="small"
                              onClick={() => moveBlock(block.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Omlaag" placement="left">
                            <IconButton
                              size="small"
                              onClick={() => moveBlock(block.id, 'down')}
                              disabled={index === content.length - 1}
                            >
                              <ArrowDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eigenschappen" placement="left">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBlock(block);
                                setBlockPropertiesOpen(true);
                              }}
                            >
                              <SettingsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Verwijderen" placement="left">
                            <IconButton
                              size="small"
                              onClick={() => deleteBlock(block.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Divider flexItem />
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'grab',
                              '&:active': { cursor: 'grabbing' }
                            }}
                          >
                            <DragIcon fontSize="small" />
                          </Box>
                        </Box>

                        {/* Block Content */}
                        {renderBlock(block, index)}
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add Block Button */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'grey.50',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Voeg een nieuw blok toe
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<TextFieldsIcon />}
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
                  </Box>
                </Box>
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      {/* Block Properties Dialog */}
      {renderBlockProperties()}

      {/* Photo Selector Dialog */}
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

          {(selectedTab === 'photos' || selectedBlock?.type === 'image') ? (
            <Grid container spacing={2}>
              {photos.map((photo) => {
                const isSelected = selectedBlock?.type === 'slideshow'
                  ? selectedPhotos.some(p => p.id === photo.id)
                  : false;

                const photoUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${photo.filename}`;
                console.log('Foto URL:', photoUrl);

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                    <Card
                      onClick={() => handlePhotoSelect(photo)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                        border: isSelected ? 2 : 0,
                        borderColor: 'primary.main',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height={140}
                        image={photoUrl}
                        alt={photo.title || 'Foto'}
                        sx={{ objectFit: 'cover' }}
                      />
                      {photo.title && (
                        <CardContent>
                          <Typography variant="subtitle2" noWrap>
                            {photo.title}
                          </Typography>
                        </CardContent>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {albums.map((album) => {
                const albumCoverUrl = album.cover_photo ? 
                  `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${album.cover_photo.filename}` :
                  'placeholder-image.jpg';
                console.log('Album cover URL:', albumCoverUrl);

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={album.id}>
                    <Card
                      onClick={() => handleAlbumSelect(album)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height={140}
                        image={albumCoverUrl}
                        alt={album.title || 'Album'}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography variant="subtitle1" noWrap>
                          {album.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {album.photos?.length || 0} foto's
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
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
              {selectedPhotos.length} foto's toevoegen
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PageContentEditor; 