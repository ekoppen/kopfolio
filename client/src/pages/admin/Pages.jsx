import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  SubdirectoryArrowRight as SubdirectoryArrowRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const SortablePageCard = ({ page, onEdit, onDelete, level = 0 }) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: page.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    ml: level * 4,
    mb: 2,
  };
  
  return (
    <Card
      ref={setNodeRef}
      elevation={0}
      sx={{
        ...style,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 12px rgba(0,0,0,0.5)' 
          : '0 2px 12px rgba(0,0,0,0.1)',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.6)' 
            : '0 4px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      {level > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: -28,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            color: 'primary.main'
          }}
        >
          <SubdirectoryArrowRightIcon />
        </Box>
      )}
      
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box {...attributes} {...listeners} sx={{ 
              cursor: 'grab',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}>
              <DragIcon />
            </Box>
            <Box>
              <Typography variant="h6" component="h2">
                {page.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {page.description || 'Geen beschrijving'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                {page.is_in_menu && (
                  <Chip
                    size="small"
                    label={page.is_parent_only ? "Menu Container" : (level === 0 ? "Hoofdmenu" : "Submenu")}
                    color={page.is_parent_only ? "warning" : (level === 0 ? "primary" : "secondary")}
                    sx={{ 
                      height: 24,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                )}
                <Chip
                  size="small"
                  label={page.parent_id ? `/${page.parent_slug}/${page.slug}` : `/${page.slug}`}
                  variant="outlined"
                  sx={{ 
                    height: 24,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => onEdit(page)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(page)}
              disabled={page.slug === 'home'}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const RenderPageTree = ({ pages, onEdit, onDelete, level = 0 }) => {
  return pages.map(page => (
    <React.Fragment key={page.id}>
      <SortablePageCard
        page={page}
        onEdit={onEdit}
        onDelete={onDelete}
        level={level}
      />
      {page.children && page.children.length > 0 && (
        <RenderPageTree
          pages={page.children}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      )}
    </React.Fragment>
  ));
};

const AdminPages = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pages, setPages] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const loadPages = async () => {
    try {
      const response = await api.get('/pages');
      setPages(response.data);
    } catch (error) {
      console.error('Fout bij ophalen pagina\'s:', error);
      showToast('Fout bij ophalen pagina\'s', 'error');
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleEditClick = (page) => {
    navigate(`/admin/paginas/${page.id}`);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/pages/${selectedPage.id}`);
      showToast('Pagina succesvol verwijderd', 'success');
      setDeleteDialogOpen(false);
      setSelectedPage(null);
      loadPages();
    } catch (error) {
      console.error('Fout bij verwijderen pagina:', error);
      showToast('Fout bij verwijderen pagina', 'error');
    }
  };

  const confirmDelete = (page) => {
    if (page.slug === 'home') {
      showToast('De home pagina kan niet worden verwijderd', 'error');
      return;
    }
    setSelectedPage(page);
    setDeleteDialogOpen(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    try {
      // Update de parent_id van de versleepte pagina
      const draggedPage = pages.find(p => p.id === active.id);
      const targetPage = pages.find(p => p.id === over.id);

      if (draggedPage && targetPage) {
        // Bepaal de nieuwe menu_order
        const siblings = pages.filter(p => 
          (targetPage.is_parent_only ? 
            p.parent_id === targetPage.id : 
            p.parent_id === targetPage.parent_id) && 
          p.is_in_menu
        );
        
        const newOrder = siblings.findIndex(p => p.id === targetPage.id);
        
        const updatedPage = {
          ...draggedPage,
          parent_id: targetPage.is_parent_only ? targetPage.id : targetPage.parent_id,
          menu_order: newOrder >= 0 ? newOrder : siblings.length
        };

        await api.put(`/pages/${draggedPage.id}`, updatedPage);
        showToast('Pagina structuur bijgewerkt', 'success');
        loadPages();
      }
    } catch (error) {
      console.error('Fout bij bijwerken pagina structuur:', error);
      showToast('Fout bij bijwerken pagina structuur', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {pages.length} pagina('s)
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('nieuw')}
        >
          Nieuwe Pagina
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <RenderPageTree
            pages={pages.filter(p => !p.parent_id)}
            onEdit={handleEditClick}
            onDelete={confirmDelete}
          />
        </SortableContext>
      </DndContext>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Pagina verwijderen</DialogTitle>
        <DialogContent>
          <Typography>
            Weet je zeker dat je de pagina "{selectedPage?.title}" wilt verwijderen?
            {selectedPage?.children?.length > 0 && (
              <Typography color="error" sx={{ mt: 2 }}>
                Let op: Deze pagina heeft subpagina's die ook verwijderd zullen worden!
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuleren</Button>
          <Button onClick={handleDelete} color="error">Verwijderen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPages; 