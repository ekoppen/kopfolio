import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      showToast('Succesvol ingelogd', 'success');
      navigate('/admin');
    } catch (error) {
      console.error('Login fout:', error);
      showToast(error.userMessage || 'Fout bij inloggen', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -60%)',
        width: '100%'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.5)' 
              : '0 8px 32px rgba(0,0,0,0.1)',
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
                Inloggen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Log in om je portfolio te beheren
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Gebruikersnaam"
              name="username"
              value={formData.username}
              onChange={handleChange}
              variant="outlined"
              required
              autoFocus
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Wachtwoord"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<LoginIcon />}
              sx={{
                mt: 2,
                height: 48,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 