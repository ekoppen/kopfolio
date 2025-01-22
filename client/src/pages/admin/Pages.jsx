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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import PageEditor from '../../components/PageEditor';
import api from '../../utils/api';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadPages = async () => {
    try {
      const response = await api.get('/pages');
      setPages(response.data);
    } catch (error) {
      console.error('Fout bij ophalen pagina\'s:', error);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleDeleteClick = (page) => {
    setSelectedPage(page);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/pages/${selectedPage.id}`);
      setPages(pages.filter(p => p.id !== selectedPage.id));
      setDeleteDialogOpen(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Fout bij verwijderen pagina:', error);
    }
  };

  const handleEditClick = (page) => {
    setSelectedPage(page);
    setEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadPages();
    setEditDialogOpen(false);
    setCreateDialogOpen(false);
    setSelectedPage(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pagina's Beheren
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Nieuwe Pagina
        </Button>
      </Box>

      <Paper>
        <List>
          {pages.map((page, index) => (
            <React.Fragment key={page.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={page.title}
                  secondary={`Laatst bijgewerkt: ${formatDate(page.created_at)}`}
                />
                <ListItemSecondaryAction>
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
                    aria-label="bewerk"
                    onClick={() => handleEditClick(page)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="verwijder"
                    onClick={() => handleDeleteClick(page)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
          {pages.length === 0 && (
            <ListItem>
              <ListItemText
                primary="Geen pagina's gevonden"
                secondary="Klik op 'Nieuwe Pagina' om je eerste pagina aan te maken"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Verwijder Dialog */}
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
          <Button onClick={handleDeleteConfirm} color="error">
            Verwijderen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bewerk Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Pagina bewerken</DialogTitle>
        <DialogContent>
          <PageEditor
            page={selectedPage}
            onSubmitSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Nieuwe Pagina Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nieuwe Pagina</DialogTitle>
        <DialogContent>
          <PageEditor onSubmitSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminPages; 