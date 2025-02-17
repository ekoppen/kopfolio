import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const EmailSettings = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    email_user: '',
    email_pass: '',
    contact_email: ''
  });
  const [testStatus, setTestStatus] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings/email');
      setSettings(response.data);
    } catch (error) {
      console.error('Fout bij laden van e-mail instellingen:', error);
      setError('Fout bij laden van e-mail instellingen');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await api.put('/settings/email', settings);
      setSuccess('E-mail instellingen succesvol bijgewerkt');
    } catch (error) {
      console.error('Fout bij updaten van e-mail instellingen:', error);
      setError('Fout bij updaten van e-mail instellingen');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await api.post('/settings/email/test');
      setSuccess('Test e-mail succesvol verzonden');
    } catch (error) {
      console.error('Fout bij versturen van test e-mail:', error);
      setError('Fout bij versturen van test e-mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        E-mail Instellingen
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Gmail Account"
          name="email_user"
          value={settings.email_user}
          onChange={handleChange}
          fullWidth
          required
          helperText="Het Gmail account dat gebruikt wordt voor het verzenden van e-mails"
        />

        <TextField
          label="App Wachtwoord"
          name="email_pass"
          type={showPassword ? 'text' : 'password'}
          value={settings.email_pass}
          onChange={handleChange}
          fullWidth
          required
          helperText="Het App Wachtwoord gegenereerd in je Google Account instellingen"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="Contact E-mail"
          name="contact_email"
          type="email"
          value={settings.contact_email}
          onChange={handleChange}
          fullWidth
          required
          helperText="Het e-mailadres waar contactformulier berichten naar toe worden gestuurd"
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleTestEmail}
            disabled={loading}
          >
            Test E-mail Versturen
          </Button>
        </Box>

        {testStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Test e-mail succesvol verzonden! Controleer je inbox.
          </Alert>
        )}

        {testStatus === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Fout bij verzenden test e-mail. Controleer je instellingen.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default EmailSettings; 