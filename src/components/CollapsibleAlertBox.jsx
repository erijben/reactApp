import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Drawer, Badge } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { Alert } from '@mui/material';
import { keyframes } from '@emotion/react';

const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  80%, 60% {
    transform: translateX(-10px);
  }
  40%, 80% {
    transform: translateX(10px);
  }
`;

const CollapsibleAlertBox = ({ alerts }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newAlert, setNewAlert] = useState(false);

  useEffect(() => {
    if (alerts.length > 0) {
      setNewAlert(true);
      setTimeout(() => setNewAlert(false), 1000); // Animation duration
    }
  }, [alerts]);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <Box>
      <Box
        onClick={handleDrawerOpen}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'red',
          padding: '10px',
          borderRadius: '5px',
          animation: newAlert ? `${shakeAnimation} 0.5s` : 'none',
        }}
      >
        <Badge badgeContent={alerts.length} color="secondary">
          <NotificationsIcon />
        </Badge>
        <Typography variant="h6" color="inherit" sx={{ marginLeft: '10px' }}>
          {`Alertes récentes (${alerts.length})`}
        </Typography>
      </Box>
      <Drawer anchor="right" open={isDrawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 300, padding: '10px' }}>
          <IconButton onClick={handleDrawerClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Alertes récentes
          </Typography>
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.notificationColor || 'info'}
                icon={<ErrorOutlineIcon fontSize="inherit" />}
                sx={{ my: 2 }}
              >
                {alert.message || "Aucun message"}
              </Alert>
            ))
          ) : (
            <Typography>Aucune alerte récente.</Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default CollapsibleAlertBox;
