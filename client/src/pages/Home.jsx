import React from 'react';
import { Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welkom bij Kopfolio
      </Typography>
      <Typography variant="body1" paragraph>
        Hier komen binnenkort de foto's uit het home-album te staan.
      </Typography>
    </Box>
  );
};

export default Home; 