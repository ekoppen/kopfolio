import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Typography } from '@mui/material';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

/**
 * Component voor het bijsnijden van een afbeelding om een favicon te maken
 */
const LogoCropper = ({ open, onClose, logoUrl, onCropComplete }) => {
  const cropperRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [cropData, setCropData] = useState(null);

  // Reset de zoom wanneer de dialog opent
  useEffect(() => {
    if (open) {
      setZoom(1);
      setCropData(null);
    }
  }, [open]);

  // Functie om de bijgesneden afbeelding te genereren
  const getCropData = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: 64,
        height: 64,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      if (canvas) {
        // Genereer een base64 string van de afbeelding
        const base64Image = canvas.toDataURL('image/png');
        setCropData(base64Image);
        
        // Stuur de base64 string naar de parent component
        onCropComplete(base64Image);
      }
    }
  };

  // Functie om de zoom aan te passen
  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.zoomTo(newValue);
    }
  };

  // Functie om het voorbeeld te genereren zonder het te uploaden
  const generatePreview = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: 64,
        height: 64,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      if (canvas) {
        const croppedImageUrl = canvas.toDataURL('image/png');
        setCropData(croppedImageUrl);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle>Selecteer een deel van het logo voor de favicon</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Selecteer een vierkant gedeelte van het logo dat je wilt gebruiken als favicon.
            De favicon wordt weergegeven in de adresbalk en tabblad van de browser.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 60%', minWidth: 300 }}>
              <Cropper
                ref={cropperRef}
                src={logoUrl}
                style={{ height: 400, width: '100%' }}
                aspectRatio={1}
                guides={true}
                viewMode={1}
                dragMode="move"
                scalable={true}
                zoomable={true}
                autoCropArea={0.6}
                background={false}
                responsive={true}
                checkOrientation={false}
                cropBoxResizable={true}
                cropBoxMovable={true}
                zoomOnWheel={false}
              />
              <Box sx={{ mt: 2, px: 2 }}>
                <Typography id="zoom-slider" gutterBottom>
                  Zoom
                </Typography>
                <Slider
                  value={zoom}
                  onChange={handleZoomChange}
                  aria-labelledby="zoom-slider"
                  min={0.1}
                  max={3}
                  step={0.1}
                  marks={[
                    { value: 0.1, label: '0.1x' },
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' },
                    { value: 3, label: '3x' },
                  ]}
                />
              </Box>
            </Box>
            
            <Box sx={{ flex: '1 1 30%', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Voorbeeld
              </Typography>
              {cropData ? (
                <Box sx={{ 
                  width: 64, 
                  height: 64, 
                  border: '1px solid #ccc', 
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2
                }}>
                  <img 
                    src={cropData} 
                    alt="Bijgesneden voorbeeld" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  width: 64, 
                  height: 64, 
                  border: '1px solid #ccc', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  bgcolor: '#f5f5f5'
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Voorbeeld
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="outlined" 
                onClick={generatePreview}
                sx={{ mb: 1 }}
              >
                Voorbeeld genereren
              </Button>
              
              <Typography variant="caption" color="text.secondary" align="center">
                Klik op "Voorbeeld genereren" om te zien hoe de favicon eruit zal zien
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuleren</Button>
        <Button 
          onClick={() => {
            getCropData();
            onClose();
          }} 
          variant="contained" 
          color="primary"
          disabled={!cropperRef.current}
        >
          Toepassen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoCropper; 