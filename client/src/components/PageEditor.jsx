import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'align',
  'link', 'image'
];

const PageEditor = ({ page = null, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        content: page.content || ''
      });
    }
  }, [page]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Vul alle verplichte velden in');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (page) {
        // Update bestaande pagina
        await api.put(`/pages/${page.id}`, formData);
        setSuccess('Pagina succesvol bijgewerkt');
      } else {
        // Maak nieuwe pagina
        await api.post('/pages', formData);
        setSuccess('Pagina succesvol aangemaakt');
        setFormData({ title: '', content: '' });
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
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
          <TextField
            fullWidth
            label="Titel"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : page ? (
              'Pagina Bijwerken'
            ) : (
              'Pagina Aanmaken'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PageEditor; 