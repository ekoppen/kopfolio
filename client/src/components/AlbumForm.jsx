import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../utils/api';

const AlbumForm = ({ album = null, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_home: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (album) {
      setFormData({
        title: album.title || '',
        description: album.description || '',
        is_home: album.is_home || false
      });
    }
  }, [album]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_home' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (album) {
        // Update bestaand album
        await api.put(`/albums/${album.id}`, formData);
        setSuccess('Album succesvol bijgewerkt');
      } else {
        // Maak nieuw album
        await api.post('/albums', formData);
        setSuccess('Album succesvol aangemaakt');
        setFormData({ title: '', description: '', is_home: false });
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Titel"
        name="title"
        value={formData.title}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Beschrijving"
        name="description"
        value={formData.description}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={3}
      />

      <FormControlLabel
        control={
          <Switch
            checked={formData.is_home}
            onChange={handleChange}
            name="is_home"
          />
        }
        label="Home Album"
        sx={{ my: 1 }}
      />

      <Box sx={{ mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : album ? (
            'Album Bijwerken'
          ) : (
            'Album Aanmaken'
          )}
        </Button>
      </Box>
    </form>
  );
};

export default AlbumForm; 