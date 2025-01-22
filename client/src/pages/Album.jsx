import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

const Album = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Album
      </Typography>
      <Typography variant="body1" paragraph>
        Album ID: {id}
      </Typography>
    </Box>
  );
};

export default Album; 