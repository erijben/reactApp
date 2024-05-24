import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import Header from "../../components/Header";
const InventoryList = () => {
  const [inventories, setInventories] = useState([]);

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
      <Header title= 'Liste des Inventaires'/>
      <List>
        {inventories.map(inventory => (
          <ListItem key={inventory._id}>
            <ListItemText
              primary={`Date: ${new Date(inventory.date).toLocaleDateString()}`}
              secondary={`Nombre d'équipements scannés: ${inventory.scannedEquipmentsCount}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InventoryList;