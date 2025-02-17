import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, useTheme } from '@mui/material';

const ToastContext = createContext({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const theme = useTheme();

  const showToast = (message, severity = 'success') => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          minWidth: '400px',
          zIndex: 9999,
          '& .MuiPaper-root': {
            width: '100%',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 12px rgba(255,255,255,0.1)' 
              : '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px'
          }
        }}
      >
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          variant="filled" 
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            borderRadius: '8px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(255,255,255,0.05)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              padding: '8px 0',
              fontWeight: 500
            },
            '& .MuiAlert-action': {
              padding: '0 8px'
            },
            '&.MuiAlert-standardSuccess, &.MuiAlert-filledSuccess': {
              backgroundColor: `${theme.palette.success.main} !important`,
              color: theme.palette.success.contrastText,
              '& .MuiAlert-icon': {
                color: theme.palette.success.contrastText
              }
            },
            '&.MuiAlert-standardError, &.MuiAlert-filledError': {
              backgroundColor: `${theme.palette.error.main} !important`,
              color: theme.palette.error.contrastText,
              '& .MuiAlert-icon': {
                color: theme.palette.error.contrastText
              }
            },
            '&.MuiAlert-standardWarning, &.MuiAlert-filledWarning': {
              backgroundColor: `${theme.palette.warning.main} !important`,
              color: theme.palette.warning.contrastText,
              '& .MuiAlert-icon': {
                color: theme.palette.warning.contrastText
              }
            },
            '&.MuiAlert-standardInfo, &.MuiAlert-filledInfo': {
              backgroundColor: `${theme.palette.info.main} !important`,
              color: theme.palette.info.contrastText,
              '& .MuiAlert-icon': {
                color: theme.palette.info.contrastText
              }
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}; 