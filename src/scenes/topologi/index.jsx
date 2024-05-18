import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Topologi = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [lastScannedRFID, setLastScannedRFID] = useState(null);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const response = await axios.get('https://nodeapp-ectt.onrender.com/equip');
        setEquipmentList(response.data);
      } catch (error) {
        console.error('Error fetching equipments:', error);
      }
    };
    fetchEquipments();

    const interval = setInterval(fetchEquipments, 5000); // Poll every 5 seconds
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  const handleRFIDScan = async () => {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      ndef.addEventListener('reading', event => {
        const rfid = event.serialNumber;
        const scannedEquipment = equipmentList.find(equip => equip.RFID === rfid);
        if (scannedEquipment) {
          setEquipment(scannedEquipment);
          setLastScannedRFID(rfid); // Save the last scanned RFID
          // Update the equipment list after a scan
          axios.get('https://nodeapp-ectt.onrender.com/equip')
            .then(response => setEquipmentList(response.data))
            .catch(error => console.error('Error fetching equipments:', error));
        } else {
          console.error('Équipement non trouvé');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du tag RFID:', error);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h3" mb="20px">Inventaire</Typography>
      <Button variant="contained" color="primary" onClick={handleRFIDScan}>
        Scanner RFID
      </Button>
      {equipment && (
        <Box mt="20px">
          <Typography variant="h5">Équipement scanné :</Typography>
          <Typography>Nom : {equipment.Nom}</Typography>
          <Typography>Type : {equipment.Type}</Typography>
          <Typography>Adresse IP : {equipment.AdresseIp}</Typography>
          <Typography>RFID : {equipment.RFID}</Typography>
        </Box>
      )}
      <Box mt="20px">
        <Typography variant="h5">Tous les équipements :</Typography>
        {equipmentList.map(equip => (
          <Box key={equip._id} mt="10px">
            <Typography>Nom : {equip.Nom}</Typography>
            <Typography>Type : {equip.Type}</Typography>
            <Typography>Adresse IP : {equip.AdresseIp}</Typography>
            <Typography>RFID : {equip.RFID}</Typography>
            <Typography>Etat : {equip.Etat}</Typography>
          </Box>
        ))}
      </Box>
      <Button variant="contained" color="secondary" onClick={() => navigate('/dashboard')} mt="20px">
        Retour au Dashboard
      </Button>
    </Box>
  );
};

export default Topologi;
