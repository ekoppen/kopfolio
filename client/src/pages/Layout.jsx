  <Box sx={{ 
    display: 'flex', 
    flexDirection: barPosition === 'full-left' ? 'row' : 'column', 
    minHeight: '100vh',
    bgcolor: 'transparent',
    position: 'relative'
  }}>
    <AppBar 
      position={barPosition === 'full-left' ? 'relative' : "sticky"}
      elevation={0}
      sx={{ 
        bgcolor: 'transparent',
        borderBottom: barPosition !== 'full-left' ? '1px solid' : 'none',
        borderRight: 'none',
        borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
        backdropFilter: barPosition === 'full-left' ? 'none' : 'blur(8px)',
        zIndex: barPosition === 'full-left' ? 200 : 1800,
        width: barPosition === 'full-left' ? '280px' : '100%',
        height: barPosition === 'full-left' ? '100vh' : 'auto'
      }}
    >
      // ... existing code ...
    </AppBar>

    <Box sx={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      position: 'relative'
    }}>
      <Container 
        component="main" 
        sx={{ 
          flex: 1,
          py: 4,
          px: {
            xs: 2,
            sm: 3,
            md: 4
          },
          ml: barPosition === 'full-left' ? '280px' : 0,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: 'transparent'
        }}
      >
        <Outlet />
      </Container>

      <Box 
        component="footer" 
        sx={{ 
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: settings.logo_position === 'center' ? 'center' : 'flex-end',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(60, 60, 60, 0.6)',
          position: 'relative',
          ml: barPosition === 'full-left' ? '280px' : 0,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)',
          borderTop: 1,
          borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: settings.footer_color || (theme.palette.mode === 'dark' ? '#fff' : '#000'),
            fontSize: `${settings.footer_size || 14}px`,
            fontFamily: settings.footer_font || 'system-ui',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textAlign: settings.logo_position === 'center' ? 'center' : 'right',
            position: 'relative',
            zIndex: 1,
            textShadow: theme.palette.mode === 'dark'
              ? '0 1px 2px rgba(0,0,0,0.5), 0 1px 8px rgba(0,0,0,0.25)'
              : '0 1px 2px rgba(255,255,255,0.5), 0 1px 8px rgba(255,255,255,0.25)',
            mixBlendMode: theme.palette.mode === 'dark' ? 'lighten' : 'darken',
            width: settings.logo_position === 'center' ? '100%' : 'auto',
            px: 3
          }}
        >
          {settings.footer_text}
        </Typography>
      </Box>
    </Box>
  </Box> 