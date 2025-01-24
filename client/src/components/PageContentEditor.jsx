import React, { useState, useEffect } from 'react';
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
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Collections as SlideshowIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Rich text editor configuratie
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
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

const PageContentEditor = ({ initialContent = [], onChange, onSave, onCancel }) => {
  const [content, setContent] = useState(initialContent);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [photoSelectorOpen, setPhotoSelectorOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [blockPropertiesOpen, setBlockPropertiesOpen] = useState(false);

  // Update content wanneer initialContent verandert
  useEffect(() => {
    console.log('Initial content gewijzigd:', initialContent);
    setContent(initialContent);
  }, [initialContent]);

  // Laad foto's wanneer de foto selector geopend wordt
  useEffect(() => {
    if (photoSelectorOpen) {
      loadPhotos();
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

  const updateBlock = (id, newData) => {
    const newContent = content.map(block => 
      block.id === id ? { ...block, ...newData } : block
    );
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
                position: 'absolute',
                top: -40,
                left: 0,
                right: 40,
                backgroundColor: 'background.paper',
                borderColor: 'transparent',
                borderRadius: 1,
                opacity: 0,
                transition: 'opacity 0.2s',
                boxShadow: 1,
                zIndex: 1
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
        const imageContent = Array.isArray(block.content) ? block.content : block.content ? [block.content] : [];
        const columns = imageContent.length === 1 ? 12 : 
                       imageContent.length === 2 ? 6 :
                       imageContent.length === 3 ? 4 : 
                       imageContent.length === 4 ? 3 : 6;
        
        return (
          <Box>
            {imageContent.length > 0 ? (
              <Grid container spacing={2}>
                {imageContent.map((image, photoIndex) => (
                  <Grid item xs={12} sm={columns} key={image.id}>
                    <Box
                      sx={{
                        position: 'relative',
                        '&:hover': {
                          '& .image-overlay': {
                            opacity: 1
                          }
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${image.filename}`}
                        alt={image.title || 'Afbeelding'}
                        sx={{ 
                          width: '100%',
                          height: columns === 12 ? 600 : 300,
                          objectFit: 'cover',
                          borderRadius: 1,
                          boxShadow: 3
                        }}
                      />
                      {image.showTitle && image.title && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            color: 'white',
                            p: 2,
                            borderBottomLeftRadius: 1,
                            borderBottomRightRadius: 1
                          }}
                        >
                          <Typography variant="subtitle1">
                            {image.title}
                          </Typography>
                          {image.description && (
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {image.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
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
                  Klik op het tandwiel icoon om afbeeldingen te selecteren
                </Typography>
              </Box>
            )}
          </Box>
        );
      
      case 'slideshow':
        return (
          <Box>
            {block.content && block.content.length > 0 ? (
              <Box 
                sx={{ 
                  position: 'relative',
                  height: 500,
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: 3,
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
                        position: 'relative',
                        height: '100%',
                      }}
                    >
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${photo.filename}`}
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
                      {block.settings?.showTitles && photo.title && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            color: 'white',
                            p: 2
                          }}
                        >
                          <Typography variant="h6">
                            {photo.title}
                          </Typography>
                          {photo.description && (
                            <Typography variant="body1" sx={{ opacity: 0.8 }}>
                              {photo.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Slider>
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

    return (
      <Dialog
        open={blockPropertiesOpen}
        onClose={() => setBlockPropertiesOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedBlock.type === 'image' ? 'Afbeelding Eigenschappen' : 'Slideshow Eigenschappen'}
        </DialogTitle>
        <DialogContent>
          {selectedBlock.type === 'image' && selectedBlock.content && (
            <>
              {Array.isArray(selectedBlock.content) ? (
                selectedBlock.content.map((image, index) => (
                  <Box key={image.id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Afbeelding {index + 1}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${image.filename}`}
                        alt={image.title || 'Thumbnail'}
                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <TextField
                          fullWidth
                          label="Titel"
                          value={image.title || ''}
                          onChange={(e) => {
                            const newContent = [...selectedBlock.content];
                            newContent[index] = { ...image, title: e.target.value };
                            updateBlock(selectedBlock.id, { content: newContent });
                          }}
                          margin="dense"
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="Beschrijving"
                          value={image.description || ''}
                          onChange={(e) => {
                            const newContent = [...selectedBlock.content];
                            newContent[index] = { ...image, description: e.target.value };
                            updateBlock(selectedBlock.id, { content: newContent });
                          }}
                          margin="dense"
                          size="small"
                          multiline
                          rows={2}
                        />
                      </Box>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={image.showTitle || false}
                          onChange={(e) => {
                            const newContent = [...selectedBlock.content];
                            newContent[index] = { ...image, showTitle: e.target.checked };
                            updateBlock(selectedBlock.id, { content: newContent });
                          }}
                        />
                      }
                      label="Toon titel en beschrijving"
                    />
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Titel"
                    value={selectedBlock.content.title || ''}
                    onChange={(e) => updateBlock(selectedBlock.id, {
                      content: {
                        ...selectedBlock.content,
                        title: e.target.value
                      }
                    })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Beschrijving"
                    value={selectedBlock.content.description || ''}
                    onChange={(e) => updateBlock(selectedBlock.id, {
                      content: {
                        ...selectedBlock.content,
                        description: e.target.value
                      }
                    })}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedBlock.content.showTitle || false}
                        onChange={(e) => updateBlock(selectedBlock.id, {
                          content: {
                            ...selectedBlock.content,
                            showTitle: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Toon titel en beschrijving"
                  />
                </>
              )}
            </>
          )}

          {selectedBlock.type === 'slideshow' && (
            <>
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
            </>
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setPhotoSelectorOpen(true);
              if (selectedBlock.type === 'slideshow' && selectedBlock.content) {
                setSelectedPhotos(selectedBlock.content);
              }
              setBlockPropertiesOpen(false);
            }}
            sx={{ mt: 2 }}
          >
            {selectedBlock.type === 'image' ? 'Afbeeldingen Beheren' : 'Slideshow Foto\'s Beheren'}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockPropertiesOpen(false)}>
            Sluiten
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      {/* Content Blocks */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="content">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
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
                      {/* Block Controls */}
                      <Box
                        className="block-controls"
                        sx={{
                          position: 'absolute',
                          right: -40,
                          top: 0,
                          zIndex: 1,
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          p: 0.5
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
            </Box>
          )}
        </Droppable>
      </DragDropContext>

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
          <Grid container spacing={2}>
            {photos.map((photo) => {
              const isSelected = selectedBlock?.type === 'slideshow'
                ? selectedPhotos.some(p => p.id === photo.id)
                : false;

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
                      height="140"
                      image={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/thumb_${photo.filename}`}
                      alt={photo.title || 'Foto'}
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
          {selectedBlock?.type === 'slideshow' && (
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
    </Box>
  );
};

export default PageContentEditor; 