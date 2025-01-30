import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '@mui/material/styles';
import PageForm from './PageForm';
import ImageEditor from './ImageEditor';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [slideShowSettingsOpen, setSlideShowSettingsOpen] = useState(false);
  const [slideShowSettings, setSlideShowSettings] = useState({
    interval: 5000,
    transition: 'fade',
    autoPlay: true,
    showTitles: false,
    showShadow: false
  });
  const [localSlideShowSettings, setLocalSlideShowSettings] = useState({
    interval: 5000,
    transition: 'fade',
    autoPlay: true,
    showTitles: false,
    showShadow: false
  });
  const imageEditorRefs = useRef({});
  const [menuPages, setMenuPages] = useState([]);

  const loadPages = async () => {
    try {
      const response = await api.get('/pages');
      // Zorg ervoor dat de home pagina bovenaan staat
      const sortedPages = response.data.sort((a, b) => {
        if (a.slug === 'home') return -1;
        if (b.slug === 'home') return 1;
        return 0;
      });
      setPages(sortedPages);
    } catch (error) {
      showToast('Fout bij ophalen pagina\'s', 'error');
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage?.settings?.slideshow) {
      const settings = selectedPage.settings.slideshow;
      setSlideShowSettings(settings);
      setLocalSlideShowSettings(settings);
    }
  }, [selectedPage]);

  useEffect(() => {
    // Update menuPages wanneer pages verandert
    const sortedMenuPages = pages
      .filter(page => page.is_in_menu)
      .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
    setMenuPages(sortedMenuPages);
  }, [pages]);

  const handleEditClick = (page) => {
    setSelectedPage(page);
    if (page.is_home) {
      // Laad bestaande slideshow instellingen
      const settings = page.settings?.slideshow || {};
      setSlideShowSettings(settings);
      setLocalSlideShowSettings(settings);
      setSlideShowSettingsOpen(true);
    } else {
      // Voor andere pagina's, navigeer naar de editor
      navigate(`/admin/paginas/${page.id}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage || selectedPage.slug === 'home') return;

    try {
      await api.delete(`/pages/${selectedPage.id}`);
      showToast('Pagina succesvol verwijderd');
      loadPages();
    } catch (error) {
      showToast('Fout bij verwijderen pagina', 'error');
    }
    setDeleteDialogOpen(false);
  };

  const confirmDelete = (page) => {
    if (page.slug === 'home') {
      showToast('De home pagina kan niet worden verwijderd', 'error');
      return;
    }
    setSelectedPage(page);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFormSuccess = () => {
    setEditDialogOpen(false);
    loadPages();
  };

  const handleSaveSlideShowSettings = async () => {
    try {
      console.log('Huidige instellingen:', selectedPage?.settings);
      console.log('Nieuwe instellingen:', localSlideShowSettings);
      
      // Update de pagina met de nieuwe slideshow instellingen
      const updatedPage = {
        ...selectedPage,
        settings: {
          ...selectedPage.settings,
          slideshow: {
            interval: localSlideShowSettings.interval,
            transition: localSlideShowSettings.transition,
            autoPlay: localSlideShowSettings.autoPlay,
            showTitles: localSlideShowSettings.showTitles,
            showShadow: localSlideShowSettings.showShadow
          }
        }
      };
      
      console.log('Versturen naar server:', updatedPage);
      
      // Sla de volledige pagina op met de nieuwe instellingen
      const response = await api.put(`/pages/${selectedPage.id}`, updatedPage);
      
      console.log('Response van server:', response.data);
      
      // Update de lokale state met de response data
      setSelectedPage(response.data);
      setSlideShowSettings(response.data.settings?.slideshow || localSlideShowSettings);
      setLocalSlideShowSettings(response.data.settings?.slideshow || localSlideShowSettings);
      
      // Stuur een event om de Home component te informeren
      window.dispatchEvent(new CustomEvent('slideshowSettingsUpdated'));
      
      showToast('Slideshow instellingen opgeslagen', 'success');
      setSlideShowSettingsOpen(false);
      loadPages();
    } catch (error) {
      console.error('Error saving slideshow settings:', error);
      showToast('Fout bij opslaan instellingen', 'error');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(menuPages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update lokale state
    setMenuPages(items);

    // Update menu order in de database
    const updatedPages = items.map((page, index) => ({
      id: page.id,
      is_in_menu: true,
      menu_order: index
    }));

    try {
      await api.put('/pages/menu/order', { pages: updatedPages });
      showToast('Menu volgorde bijgewerkt');
      loadPages();
    } catch (error) {
      showToast('Fout bij bijwerken menu volgorde', 'error');
    }
  };

  const toggleMenuStatus = async (page) => {
    try {
      const updatedPage = {
        ...page,
        is_in_menu: !page.is_in_menu,
        menu_order: !page.is_in_menu ? (menuPages.length) : null
      };

      await api.put(`/pages/${page.id}`, updatedPage);
      showToast(`Pagina ${!page.is_in_menu ? 'toegevoegd aan' : 'verwijderd uit'} menu`);
      loadPages();
    } catch (error) {
      showToast('Fout bij bijwerken menu status', 'error');
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        pt: 3,
        px: 3,
        pb: 3
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2 
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {pages.length} pagina('s)
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate('/admin/paginas/nieuw')}
            sx={{ 
              minWidth: 0, 
              width: 40, 
              height: 40, 
              p: 0,
              borderRadius: 2
            }}
          >
            <AddIcon />
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', pb: 2 }}>
          {pages.map((page) => (
            <Grid item xs="auto" key={page.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                  minWidth: 300,
                  maxWidth: 300,
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                      {page.title}
                    </Typography>
                    {page.slug === 'home' && (
                      <Chip 
                        label="Home" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 40
                    }}
                  >
                    {page.description || 'Geen beschrijving'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Laatst bewerkt: {formatDate(page.updated_at)}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ px: 2, py: 1 }}>
                  <Tooltip title="Pagina bewerken">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(page)}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'primary.50' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={page.slug === 'home' ? 'Home pagina kan niet verwijderd worden' : 'Pagina verwijderen'}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => confirmDelete(page)}
                        disabled={page.slug === 'home'}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': { bgcolor: 'error.50' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Box sx={{ flex: 1 }} />
                  <Tooltip title={page.is_in_menu ? 'Verwijder uit menu' : 'Voeg toe aan menu'}>
                    <IconButton
                      size="small"
                      onClick={() => toggleMenuStatus(page)}
                      sx={{ 
                        color: page.is_in_menu ? 'success.main' : 'text.secondary',
                        '&:hover': { bgcolor: page.is_in_menu ? 'success.50' : 'action.hover' }
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Pagina verwijderen</DialogTitle>
          <DialogContent>
            Weet je zeker dat je de pagina "{selectedPage?.title}" wilt verwijderen?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Verwijderen
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Pagina bewerken</DialogTitle>
          <DialogContent>
            <PageForm
              page={selectedPage}
              onSubmitSuccess={handleFormSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={slideShowSettingsOpen}
          onClose={() => setSlideShowSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Slideshow instellingen</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Algemene instellingen
              </Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Overgang</InputLabel>
                <Select
                  value={localSlideShowSettings.transition}
                  label="Overgang"
                  onChange={(e) => setLocalSlideShowSettings(prev => ({
                    ...prev,
                    transition: e.target.value
                  }))}
                >
                  <MenuItem value="fade">Vervagen</MenuItem>
                  <MenuItem value="slide">Schuiven</MenuItem>
                  <MenuItem value="zoom">Inzoomen</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Interval (seconden)
                </Typography>
                <Slider
                  value={localSlideShowSettings.interval / 1000}
                  min={2}
                  max={10}
                  step={0.5}
                  marks
                  onChange={(e, value) => setLocalSlideShowSettings(prev => ({
                    ...prev,
                    interval: value * 1000
                  }))}
                  valueLabelDisplay="auto"
                  valueLabelFormat={value => `${value}s`}
                />
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={localSlideShowSettings.autoPlay}
                    onChange={(e) => setLocalSlideShowSettings(prev => ({
                      ...prev,
                      autoPlay: e.target.checked
                    }))}
                  />
                }
                label="Automatisch afspelen"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localSlideShowSettings.showTitles}
                    onChange={(e) => setLocalSlideShowSettings(prev => ({
                      ...prev,
                      showTitles: e.target.checked
                    }))}
                  />
                }
                label="Toon titels en beschrijvingen"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localSlideShowSettings.showShadow}
                    onChange={(e) => setLocalSlideShowSettings(prev => ({
                      ...prev,
                      showShadow: e.target.checked
                    }))}
                  />
                }
                label="Toon schaduw"
              />

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Afbeeldingen
              </Typography>
              {selectedPage?.content?.map((image, index) => (
                <Box key={image.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
                    Afbeelding {index + 1}
                  </Typography>
                  <ImageEditor
                    ref={ref => imageEditorRefs.current[image.id] = ref}
                    image={image}
                    selectedBlock={selectedPage}
                    updateBlock={(id, updates) => {
                      const newContent = [...selectedPage.content];
                      const imageIndex = newContent.findIndex(img => img.id === image.id);
                      if (imageIndex !== -1) {
                        newContent[imageIndex] = {
                          ...newContent[imageIndex],
                          ...updates.content
                        };
                        setSelectedPage(prev => ({
                          ...prev,
                          content: newContent
                        }));
                      }
                    }}
                  />
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSlideShowSettingsOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveSlideShowSettings} variant="contained">
              Opslaan
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Menu
          </Typography>
          <Card 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.1)'
            }}
          >
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {menuPages.map((page, index) => (
                      <Draggable key={page.id} draggableId={page.id.toString()} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              borderBottom: '1px solid',
                              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                              '&:last-child': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                              <DragIcon />
                            </Box>
                            <ListItemText 
                              primary={page.title}
                              secondary={page.slug}
                            />
                            <IconButton
                              size="small"
                              onClick={() => toggleMenuStatus(page)}
                            >
                              <MenuIcon />
                            </IconButton>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPages; 