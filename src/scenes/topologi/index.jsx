import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Topologi = () => {
  const navigate = useNavigate();
  const [scannedEquipments, setScannedEquipments] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(fetchScannedEquipments, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchScannedEquipments = async () => {
    try {
      const response = await axios.get('https://nodeapp-ectt.onrender.com/equip/scanned');
      setScannedEquipments(response.data);
    } catch (error) {
      console.error('Error fetching scanned equipments:', error);
    }
  };

  const handleRFIDScan = async () => {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      ndef.addEventListener('reading', async event => {
        const rfid = event.serialNumber;
        try {
          const response = await axios.get(`https://nodeapp-ectt.onrender.com/equip/find/${rfid}`);
          const { success, equipment, message } = response.data;
          if (success) {
            setScannedEquipments([...scannedEquipments, equipment]);
            setAlertMessage(`Équipement scanné: ${equipment.Nom}`);
          } else {
            setAlertMessage(message || 'Équipement non trouvé');
          }
        } catch (error) {
          console.error('Error fetching equipment by RFID:', error);
          setAlertMessage('Erreur lors de la recherche de l\'équipement');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du tag RFID:', error);
      setAlertMessage('Erreur lors de la lecture du tag RFID');
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h3" mb="20px">Inventaire</Typography>
      <Button variant="contained" color="primary" onClick={handleRFIDScan}>
        Scanner RFID
      </Button>
      <Box mt="20px">
        <Typography variant="h5">Équipements scannés :</Typography>
        {scannedEquipments.map(equip => (
          <Box key={equip._id} mt="10px">
            <Typography>Nom : {equip.Nom}</Typography>
            <Typography>Type : {equip.Type}</Typography>
            <Typography>Adresse IP : {equip.AdresseIp}</Typography>
            <Typography>RFID : {equip.RFID}</Typography>
            <Typography>Etat : {equip.Etat}</Typography>
          </Box>
        ))}
      </Box>
      <Snackbar
        open={!!alertMessage}
        autoHideDuration={6000}
        onClose={() => setAlertMessage('')}
        message={alertMessage}
      />
      <Button variant="contained" color="secondary" onClick={() => navigate('/dashboard')} mt="20px">
        Retour au Dashboard
      </Button>
    </Box>
  );
};

export default Topologi;
