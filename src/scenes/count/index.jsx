import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider } from '@mui/material';
import Header from "../../components/Header";
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';

const InventoryList = () => {
  const [inventories, setInventories] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const response = await axios.get('https://nodeapp-ectt.onrender.com/inventory');
        setInventories(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des inventaires:', error);
      }
    };

    fetchInventories();
  }, []);

  return (
    <Box m="20px">
      <Header title='Liste des Inventaires' />
      <Paper elevation={3} sx={{ p: 3, backgroundColor: colors.primary[400] }}>
        <List>
          {inventories.map(inventory => (
            <React.Fragment key={inventory._id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={<Typography variant="h6" style={{ color: colors.grey[100] }}>Date: {new Date(inventory.date).toLocaleDateString()}</Typography>}
                  secondary={<Typography variant="body2" style={{ color: colors.grey[300] }}>Nombre d'équipements scannés: {inventory.scannedEquipmentsCount}</Typography>}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default InventoryList;
