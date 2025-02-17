import React, { useState } from 'react';
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
  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <PageContent
        content={[
          {
            type: 'contact',
            id: 'contact-form'
          }
        ]}
      />
    </Box>
  );
};

export default Contact; 