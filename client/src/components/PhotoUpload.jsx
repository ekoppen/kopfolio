import React, { useState, useRef } from 'react';
import { Box, Button, LinearProgress, Typography, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const PhotoUpload = ({ onUploadSuccess }) => {
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
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      // Bereken hashes voor alle bestanden
      const fileHashes = await Promise.all(
        files.map(async (file) => ({
          file,
          hash: await calculateHash(file)
        }))
      );

      // Check voor duplicaten
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/photos/check-duplicates`,
        {
          hashes: fileHashes.map(fh => fh.hash)
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const duplicateHashes = new Set(response.data.duplicates);
      const uniqueFiles = fileHashes.filter(fh => !duplicateHashes.has(fh.hash));
      const duplicateFiles = fileHashes.filter(fh => duplicateHashes.has(fh.hash));

      if (duplicateFiles.length > 0) {
        showToast(
          `${duplicateFiles.length} foto('s) worden overgeslagen omdat ze al bestaan`,
          'warning'
        );
      }

      if (uniqueFiles.length === 0) {
        showToast('Alle geselecteerde foto\'s bestaan al', 'error');
        setUploading(false);
        return;
      }

      // Upload alleen unieke bestanden
      const formData = new FormData();
      uniqueFiles.forEach(({ file }) => {
        formData.append('photos', file);
      });

      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );

      showToast(
        `${uniqueFiles.length} foto('s) succesvol geüpload`,
        'success'
      );
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(
        'Er is een fout opgetreden bij het uploaden van de foto\'s',
        'error'
      );
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