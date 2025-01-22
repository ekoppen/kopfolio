import React from 'react';
import { Typography, Box } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welkom in het admin dashboard. Gebruik het menu aan de linkerkant om te navigeren.
      </Typography>
    </Box>
  );
};

export default Dashboard; 