import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
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
  Slider,
  Alert,
  FormGroup,
  Stack,
  Chip,
  CardActionArea,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Autocomplete,
  Popper,
  Fade,
  Zoom,
  Grow,
  Backdrop,
  Menu
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
  Height as SpacerIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import { useSettings } from '../contexts/SettingsContext';

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

// Font info component
const FontInfo = ({ font, fontSize }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 1, 
      mt: 1,
      p: 1,
      borderRadius: 1,
      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
    }}>
      <Typography variant="caption" sx={{ mr: 1 }}>
        Huidig lettertype:
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          fontFamily: font || 'inherit',
          fontWeight: 'medium',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
        }}
      >
        {font || 'Standaard'}
      </Typography>
      {fontSize && (
        <>
          <Typography variant="caption" sx={{ mx: 1 }}>|</Typography>
          <Typography variant="caption" sx={{ mr: 1 }}>
            Lettergrootte:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {fontSize}px
          </Typography>
        </>
      )}
    </Box>
  );
};

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

const getAspectRatioPadding = (ratio) => {
  switch (ratio) {
    case '16:9': return '56.25%'; // (9 / 16) * 100
    case '4:3': return '75%';     // (3 / 4) * 100
    case '1:1': return '100%';    // (1 / 1) * 100
    case '3:4': return '133.33%'; // (4 / 3) * 100
    default: return '56.25%';     // default 16:9
  }
};

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
              Formaat
            </Typography>
            <Select
              value={block.settings?.size || 'full'}
              onChange={(e) => onSettingsChange({ size: e.target.value })}
              fullWidth
              size="small"
              displayEmpty
            >
              <MenuItem value="small">Klein (25%)</MenuItem>
              <MenuItem value="medium">Normaal (50%)</MenuItem>
              <MenuItem value="large">Groot (75%)</MenuItem>
              <MenuItem value="full">Volledig (100%)</MenuItem>
            </Select>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Aspect Ratio
            </Typography>
            <Select
              value={block.settings?.aspectRatio || '16:9'}
              onChange={(e) => onSettingsChange({ aspectRatio: e.target.value })}
              fullWidth
              size="small"
              displayEmpty
            >
              <MenuItem value="16:9">16:9 (Breedbeeld)</MenuItem>
              <MenuItem value="4:3">4:3 (Standaard)</MenuItem>
              <MenuItem value="1:1">1:1 (Vierkant)</MenuItem>
              <MenuItem value="3:4">3:4 (Portret)</MenuItem>
            </Select>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Transitie Effect
            </Typography>
            <Select
              value={block.settings?.transition || 'fade'}
              onChange={(e) => onSettingsChange({ transition: e.target.value })}
              fullWidth
              size="small"
              displayEmpty
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
    case 'contact':
      return (
        <Paper sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">Contact Formulier</Typography>
            <IconButton onClick={onDelete} size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Dit blok toont een contact formulier waarmee bezoekers je kunnen bereiken.
            Zorg ervoor dat je de e-mail instellingen hebt geconfigureerd in het admin dashboard.
          </Alert>
        </Paper>
      );
    default:
      return null;
  }
};

const BlockEditor = ({ block, onChange, onDelete, albums, updateBlock }) => {
  const theme = useTheme();
  const { settings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [localContent, setLocalContent] = useState(block.content || '');
  const quillRef = useRef(null);

  // Debug log voor initiële content
  console.log('BlockEditor initialized with block:', block); // Debug log

  // Initialiseer localContent ALLEEN bij eerste render of als block.id verandert
  useEffect(() => {
    console.log('Block ID changed, updating localContent:', block); // Debug log
    setLocalContent(block.content || '');
  }, [block.id]); // Alleen afhankelijk van block.id, niet de hele block

  const handleTextChange = (value) => {
    console.log('handleTextChange called with:', value); // Debug log
    setLocalContent(value);
    
    // Wacht even met het updaten van de parent component
    clearTimeout(window.textUpdateTimeout);
    window.textUpdateTimeout = setTimeout(() => {
      const updatedBlock = {
        ...block,
        content: value || '' // Zorg ervoor dat content nooit undefined is
      };
      console.log('Updating block with new content:', updatedBlock); // Debug log
      onChange(updatedBlock);
    }, 300);
  };

  const handleBlur = () => {
    console.log('handleBlur called, current content:', localContent); // Debug log
    // Controleer of de content is gewijzigd en niet undefined is
    if (localContent !== block.content) {
      const updatedBlock = {
        ...block,
        content: localContent || '' // Zorg ervoor dat content nooit undefined is
      };
      console.log('Content changed on blur, updating with:', updatedBlock); // Debug log
      onChange(updatedBlock);
    }
  };

  return (
    <Box sx={{
      position: 'relative',
      mb: 2,
      p: 3,
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderRadius: 1,
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
    }}>
      {/* Block controls */}
      <Box sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 1,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(35, 35, 45, 0.95)' : '#ffffff',
        p: 0.5,
        borderRadius: 1,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(0,0,0,0.5)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <IconButton 
          size="small" 
          onClick={onDelete}
          sx={{ 
            color: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.7)' 
              : 'rgba(0, 0, 0, 0.7)' 
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Block content */}
      <Box>
        {block.type === 'text' && (
          <Box sx={{ 
            '& .ql-container': {
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '4px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
              fontFamily: settings?.font || 'inherit',
            },
            '& .ql-toolbar': {
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f8f8',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            '& .ql-editor': {
              minHeight: '150px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
              fontFamily: settings?.font || 'inherit',
              fontSize: settings?.content_font_size ? `${settings.content_font_size}px` : 'inherit',
              '& p': {
                fontFamily: settings?.font || 'inherit',
              },
              '& h1, & h2, & h3': {
                fontFamily: settings?.font || 'inherit',
              }
            }
          }}>
            <FontInfo 
              font={settings?.font} 
              fontSize={settings?.content_font_size} 
            />
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={localContent || ''}
              onChange={handleTextChange}
              onBlur={handleBlur}
              modules={modules}
              formats={formats}
            />
          </Box>
        )}

        {block.type === 'slideshow' && (
          <FormControl fullWidth>
            <InputLabel sx={{
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
            }}>
              Album
            </InputLabel>
            <Select
              value={block.albumId || ''}
              onChange={(e) => onChange({ ...block, albumId: e.target.value })}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : theme.palette.primary.main,
                },
                '& .MuiSelect-select': {
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                },
              }}
            >
              {/* ... existing MenuItems ... */}
            </Select>
          </FormControl>
        )}

        {/* Toggle switches */}
        <FormGroup sx={{ mt: 2 }}>
          {block.type === 'slideshow' && (
            <FormControlLabel
              control={
                <Switch 
                  checked={block.settings?.show_info || false}
                  onChange={(e) => handleSettingChange('show_info', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                        '& + .MuiSwitch-track': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main,
                          opacity: 0.5
                        }
                      }
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(0, 0, 0, 0.1)'
                    },
                    '& .MuiSwitch-thumb': {
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 2px 4px rgba(0,0,0,0.5)'
                        : undefined
                    }
                  }}
                />
              }
              label={
                <Typography sx={{ 
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'inherit',
                  fontSize: '0.9rem'
                }}>
                  Toon foto informatie
                </Typography>
              }
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem',
                  fontWeight: 400
                }
              }}
            />
          )}
        </FormGroup>
      </Box>
    </Box>
  );
};

const PageContentEditor = ({ initialContent = [], onChange }) => {
  const [content, setContent] = useState(initialContent);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [showAlbumSelector, setShowAlbumSelector] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showSlideshowSettings, setShowSlideshowSettings] = useState(false);
  const [selectedTab, setSelectedTab] = useState('photos');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const theme = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (showPhotoSelector) {
      loadPhotos();
      loadAlbums();
    }
  }, [showPhotoSelector]);

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
      const response = await api.get('/albums?include=photos');
      setAlbums(response.data);
    } catch (error) {
      console.error('Error loading albums:', error);
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
    console.log('Adding new block of type:', type); // Debug log
    
    const newBlock = {
      id: uuidv4(),
      type,
      content: '',
      settings: {}
    };
    
    // Specifieke initialisatie per type
    switch (type) {
      case 'text':
        newBlock.content = '';
        break;
      case 'image':
        newBlock.content = null;
        break;
      case 'slideshow':
        newBlock.content = [];
        break;
      case 'spacer':
        newBlock.settings = { height: 32 };
        break;
      case 'contact':
        // Geen specifieke content nodig
        break;
    }

    console.log('Created new block:', newBlock); // Debug log
    
    const newContent = [...content, newBlock];
    console.log('New content array:', newContent); // Debug log
    
    setContent(newContent);
    onChange(newContent);
    
    if (type === 'image' || type === 'slideshow') {
      setSelectedBlock(newBlock);
      setShowPhotoSelector(true);
    }
  };

  const updateBlock = (id, updates) => {
    console.log('updateBlock called with:', { id, updates }); // Debug log
    
    // Controleer of updates een geldig object is
    if (!updates) {
      console.error('updateBlock called with invalid updates:', updates);
      return;
    }
    
    const newContent = content.map(block => {
      if (block.id === id) {
        // Maak een nieuw block object met de updates
        const updatedBlock = {
          ...block,
          // Zorg ervoor dat content altijd een string is voor tekstblokken
          content: block.type === 'text' 
            ? (updates.content !== undefined ? String(updates.content) : block.content || '')
            : (updates.content !== undefined ? updates.content : block.content),
          settings: {
            ...block.settings,
            ...(updates.settings || {})
          }
        };
        
        console.log('Updated block:', updatedBlock); // Debug log
        return updatedBlock;
      }
      return block;
    });
    
    console.log('New content array:', newContent); // Debug log
    setContent(newContent);
    onChange(newContent); // Geef de nieuwe content door aan de parent
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
      setShowPhotoSelector(false);
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
    setShowPhotoSelector(false);
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
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => moveBlock(block.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Omlaag">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => moveBlock(block.id, 'down')}
                              disabled={index === content.length - 1}
                            >
                              <ArrowDownIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Instellingen">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBlock(block);
                                setShowSlideshowSettings(true);
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
                        onChange={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock)}
                        onDelete={() => deleteBlock(block.id)}
                        albums={albums}
                        updateBlock={updateBlock}
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
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
            gap: 2
          }}
        >
          <Typography variant="subtitle1" color={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary'}>
            Voeg een nieuw blok toe
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<TextIcon />}
              onClick={() => addBlock('text')}
              sx={{
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined
                }
              }}
            >
              Tekst
            </Button>
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => addBlock('image')}
              sx={{
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined
                }
              }}
            >
              Afbeelding
            </Button>
            <Button
              variant="outlined"
              startIcon={<SlideshowIcon />}
              onClick={() => addBlock('slideshow')}
              sx={{
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined
                }
              }}
            >
              Slideshow
            </Button>
            <Button
              variant="outlined"
              startIcon={<SpacerIcon />}
              onClick={() => addBlock('spacer')}
              sx={{
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined
                }
              }}
            >
              Ruimte
            </Button>
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={() => {
                addBlock('contact');
              }}
              sx={{
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined
                }
              }}
            >
              Contact Formulier
            </Button>
          </Box>
        </Box>

      <Dialog
        open={showPhotoSelector}
        onClose={() => {
          setShowPhotoSelector(false);
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
              setShowPhotoSelector(false);
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
        open={showSlideshowSettings}
        onClose={() => {
          setShowSlideshowSettings(false);
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
            setShowSlideshowSettings(false);
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