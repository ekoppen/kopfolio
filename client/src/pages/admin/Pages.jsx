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
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip
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
import { useTheme } from '@mui/material/styles';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();

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

      <Grid container spacing={2}>
        {pages.map((page) => (
          <Grid item xs={12} sm={6} md={4} key={page.id}>
            <Card 
              elevation={0}
              sx={{ 
                height: 220,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                    onClick={() => handleEdit(page)}
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
    </Box>
  );
};

export default AdminPages; 