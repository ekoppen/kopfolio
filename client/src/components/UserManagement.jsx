import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const UserManagement = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'viewer'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fout bij ophalen gebruikers:', error);
      if (error.response?.status === 404) {
        showToast('Je bent niet ingelogd als administrator. Log uit en log opnieuw in als administrator om gebruikers te beheren.', 'error');
      } else {
        showToast(error.userMessage || 'Fout bij ophalen gebruikers', 'error');
      }
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: '',
        email: user.email,
        full_name: user.full_name,
        role: user.role
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        password: '',
        email: '',
        full_name: '',
        role: 'viewer'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      full_name: '',
      role: 'viewer'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Update bestaande gebruiker
        await api.put(`/users/${selectedUser.id}`, formData);
        showToast('Gebruiker succesvol bijgewerkt', 'success');
      } else {
        // Maak nieuwe gebruiker aan
        await api.post('/users', formData);
        showToast('Gebruiker succesvol aangemaakt', 'success');
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Fout bij opslaan gebruiker:', error);
      showToast(error.userMessage || 'Fout bij opslaan gebruiker', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      showToast('Gebruiker succesvol verwijderd', 'success');
      loadUsers();
    } catch (error) {
      console.error('Fout bij verwijderen gebruiker:', error);
      showToast(error.userMessage || 'Fout bij verwijderen gebruiker', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('nl-NL', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Gebruikers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nieuwe Gebruiker
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Naam</TableCell>
              <TableCell>Gebruikersnaam</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Laatste Login</TableCell>
              <TableCell>Aangemaakt</TableCell>
              <TableCell>Acties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{formatDate(user.last_login)}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <Tooltip title="Bewerken">
                    <IconButton onClick={() => handleOpenDialog(user)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Verwijderen">
                    <IconButton onClick={() => handleDelete(user.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Gebruiker Bewerken' : 'Nieuwe Gebruiker'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Volledige naam"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </Grid>
              {!selectedUser && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Gebruikersnaam"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={selectedUser ? 'Nieuw wachtwoord (optioneel)' : 'Wachtwoord'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!selectedUser}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    label="Rol"
                    required
                  >
                    <MenuItem value="admin">Administrator</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuleren</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Opslaan' : 'Toevoegen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 