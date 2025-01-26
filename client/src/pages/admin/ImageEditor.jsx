import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';

const ImageEditor = forwardRef(({ image, selectedBlock, updateBlock }, ref) => {
  const [localTitle, setLocalTitle] = useState(image.title || '');
  const [localDescription, setLocalDescription] = useState(image.description || '');
  const [localShowTitle, setLocalShowTitle] = useState(image.showTitle || false);
  const [localShowShadow, setLocalShowShadow] = useState(image.showShadow || false);

  useImperativeHandle(ref, () => ({
    handleSave: () => {
      const updatedImage = { 
        ...image, 
        title: localTitle,
        description: localDescription,
        showTitle: localShowTitle,
        showShadow: localShowShadow
      };
      updateBlock(selectedBlock.id, { 
        content: selectedBlock.type === 'image' ? updatedImage : selectedBlock.content.map(p => p.id === image.id ? updatedImage : p)
      });
    }
  }));

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box
          component="img"
          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/photos/${image.filename}`}
          alt={localTitle || 'Afbeelding'}
          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            label="Titel"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            margin="dense"
            size="small"
          />
          <TextField
            fullWidth
            label="Beschrijving"
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            margin="dense"
            size="small"
            multiline
            rows={2}
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={localShowTitle}
              onChange={(e) => setLocalShowTitle(e.target.checked)}
            />
          }
          label="Toon titel en beschrijving"
        />
        <FormControlLabel
          control={
            <Switch
              checked={localShowShadow}
              onChange={(e) => setLocalShowShadow(e.target.checked)}
            />
          }
          label="Toon schaduw"
        />
      </Box>
    </Box>
  );
});

export default ImageEditor; 