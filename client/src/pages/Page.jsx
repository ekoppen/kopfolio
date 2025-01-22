import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

const Page = () => {
  const { slug } = useParams();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pagina
      </Typography>
      <Typography variant="body1" paragraph>
        Pagina slug: {slug}
      </Typography>
    </Box>
  );
};

export default Page; 