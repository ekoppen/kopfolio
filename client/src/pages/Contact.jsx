import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import PageContent from '../components/PageContent';
import { useSettings } from '../contexts/SettingsContext';

const ContactForm = ({ className }) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', formData);
      showToast('Je bericht is succesvol verzonden', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Fout bij verzenden bericht:', error);
      showToast(error.userMessage || 'Fout bij verzenden bericht', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        p: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0,0,0,0.5)' 
          : '0 8px 32px rgba(0,0,0,0.1)',
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper'
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
        Contact
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Heb je een vraag of wil je meer informatie? Vul dan onderstaand formulier in en ik neem zo snel mogelijk contact met je op.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Naam"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
        />

        <TextField
          label="E-mailadres"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
        />

        <TextField
          label="Bericht"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          fullWidth
          multiline
          rows={6}
          variant="outlined"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{
            mt: 2,
            alignSelf: 'flex-start',
            minWidth: 150,
            height: 48,
            borderRadius: 2
          }}
        >
          {loading ? 'Verzenden...' : 'Versturen'}
        </Button>
      </Box>
    </Paper>
  );
};

// Exporteer het formulier component voor hergebruik in de page editor
export { ContactForm };

// De hoofdpagina component
const Contact = () => {
  const theme = useTheme();
  const { settings } = useSettings();
  const [barPosition, setBarPosition] = useState(() => {
    const savedPosition = localStorage.getItem('appBarPosition');
    return savedPosition || 'top';
  });

  // Luister naar veranderingen in barPosition
  useEffect(() => {
    const updateBarPosition = (event) => {
      setBarPosition(event.detail.position);
    };

    window.addEventListener('barPositionChanged', updateBarPosition);
    
    // Initial position
    const savedPosition = localStorage.getItem('appBarPosition');
    if (savedPosition) {
      setBarPosition(savedPosition);
    }

    return () => window.removeEventListener('barPositionChanged', updateBarPosition);
  }, []);

  return (
    <Box sx={{ 
      position: 'relative',
      height: '100%',
      width: '100%',
      zIndex: 2
    }}>
      {barPosition === 'full-left' ? (
        // In full-left mode, toon de pagina in een vlak
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          bgcolor: 'transparent'
        }}>
          <Box sx={{
            width: 'calc(100% - 64px)',
            height: '100%',
            position: 'relative',
            borderRadius: '16px',
            overflow: 'auto',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.25)',
            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f8f8',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <Box sx={{ p: 4 }}>
              <PageContent
                content={[
                  {
                    type: 'contact',
                    id: 'contact-form'
                  }
                ]}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        // In top mode, toon de pagina gecentreerd
        <Box sx={{ 
          height: '100%',
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pt: 4,
          pb: 4,
          overflow: 'auto',
          bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f0f0f0'
        }}>
          <Container maxWidth="lg" sx={{ width: '100%' }}>
            <Paper sx={{
              width: '100%',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.25)',
              bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f8f8',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <Box sx={{ p: 4 }}>
                <PageContent
                  content={[
                    {
                      type: 'contact',
                      id: 'contact-form'
                    }
                  ]}
                />
              </Box>
            </Paper>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Contact; 