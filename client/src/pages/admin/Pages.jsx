import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  const handleEdit = (page) => {
    navigate(`/admin/paginas/${page.id}`);
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

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Linker kolom met pagina's */}
        <Box sx={{ 
          flex: 1,
          bgcolor: 'grey.100',
          borderRadius: 2,
          p: 2
        }}>
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <List>
              {pages.map((page) => (
                <React.Fragment key={page.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {page.title}
                          {page.slug === 'home' && (
                            <Chip
                              icon={<HomeIcon />}
                              label="Home pagina"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={`Laatst bijgewerkt: ${formatDate(page.updated_at || page.created_at)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="bewerken"
                        onClick={() => handleEdit(page)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="bekijk"
                        onClick={() => window.open(`/pagina/${page.slug}`, '_blank')}
                        sx={{ mr: 1 }}
                      >
                        <LinkIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="verwijderen"
                        onClick={() => confirmDelete(page)}
                        disabled={page.slug === 'home'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {pages.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Geen pagina's gevonden"
                    secondary="Klik op het + icoon om je eerste pagina aan te maken"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>
      </Box>

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
    </Box>
  );
};

export default AdminPages; 