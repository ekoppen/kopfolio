import React, { useState, useRef } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const PhotoUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const calculateHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileChange = async (event) => {
    let files = Array.from(event.target.files);
    
    // Check bestandsgrootte
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showToast('error', 'Bestanden zijn te groot (max 10MB)');
      return;
    }

    setUploading(true);
    
    try {
      // Bereken hashes voor duplicaat check
      const hashes = await Promise.all(files.map(calculateHash));
      
      // Check voor duplicaten
      const { data } = await api.post('/photos/check-duplicates', { hashes });
      
      if (data.duplicates && data.duplicates.length > 0) {
        const duplicateCount = data.duplicates.length;
        const totalCount = files.length;
        showToast('warning', `${duplicateCount} van de ${totalCount} foto's zijn al geüpload en worden overgeslagen`);
        // Filter duplicaten uit de lijst
        files = files.filter((file, index) => !data.duplicates.includes(hashes[index]));
        if (files.length === 0) {
          setUploading(false);
          return;
        }
      }
      
      // Upload de bestanden
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });
      
      const uploadResponse = await api.post('/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });
      
      showToast('success', `${files.length} foto${files.length === 1 ? '' : '\'s'} succesvol geüpload`);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', 'Er is een fout opgetreden bij het uploaden');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Button
        variant="contained"
        component="label"
        onClick={() => fileInputRef.current.click()}
        startIcon={<CloudUploadIcon />}
        disabled={uploading}
      >
        Foto's uploaden
      </Button>
      
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {progress}% geüpload...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PhotoUpload; 