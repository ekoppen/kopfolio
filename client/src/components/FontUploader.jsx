import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const FontUploader = ({ onFontUploaded }) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFontUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('font', file);

    try {
      const response = await api.post('/settings/fonts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showToast('Lettertype succesvol geüpload', 'success');
        if (onFontUploaded) {
          onFontUploaded(response.data.font);
        }
      }
    } catch (error) {
      console.error('Fout bij uploaden lettertype:', error);
      setError(error.response?.data?.error || 'Fout bij uploaden lettertype');
      showToast('Fout bij uploaden lettertype', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFontUpload}
        style={{ display: 'none' }}
        id="font-upload"
      />
      <label htmlFor="font-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          disabled={uploading}
        >
          Lettertype Uploaden
        </Button>
      </label>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Ondersteunde formaten: TTF, OTF, WOFF, WOFF2 (max. 5MB)
      </Typography>
    </Box>
  );
};

export default FontUploader; 