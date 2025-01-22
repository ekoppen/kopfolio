import React, { useState } from 'react';
import {
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  ImageList,
  ImageListItem,
  IconButton
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Clear as ClearIcon } from '@mui/icons-material';
import api from '../utils/api';

const PhotoUpload = ({ onUploadComplete, albumId = null }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    // Maak previews voor de nieuwe bestanden
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, { file: file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
    setPreviews(prev => prev.filter(p => p.file !== fileToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Selecteer eerst foto\'s');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('photos', file);
    });
    if (albumId) formData.append('albumId', albumId.toString());
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    try {
      const response = await api.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(response.data.message);
      setSelectedFiles([]);
      setPreviews([]);
      setTitle('');
      setDescription('');
      
      if (onUploadComplete) {
        onUploadComplete(response.data.photos);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Fout bij uploaden foto\'s');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Foto's uploaden
        </Typography>

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

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              multiple
              onChange={handleFileSelect}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Kies foto's
              </Button>
            </label>
          </Box>

          {previews.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <ImageList cols={3} rowHeight={164} sx={{ maxHeight: 500, overflow: 'auto' }}>
                {previews.map((item, index) => (
                  <ImageListItem key={index} sx={{ position: 'relative' }}>
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      loading="lazy"
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                      size="small"
                      onClick={() => handleRemoveFile(item.file)}
                    >
                      <ClearIcon />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedFiles.length} foto's geselecteerd
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Algemene titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            helperText="Deze titel wordt gebruikt voor alle foto's"
          />

          <TextField
            fullWidth
            label="Algemene beschrijving"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            helperText="Deze beschrijving wordt gebruikt voor alle foto's"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || selectedFiles.length === 0}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              `Upload ${selectedFiles.length} foto's`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload; 