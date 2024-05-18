import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Topologi = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

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
        } else {
          console.error('Équipement non trouvé');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du tag RFID:', error);
    }
  };

  const handleSelectEquipment = (equip) => {
    if (selectedEquipment) {
      // Create connection between selectedEquipment and equip
      axios.post('https://nodeapp-ectt.onrender.com/connections', {
        from: selectedEquipment._id,
        to: equip._id
      })
      .then(() => {
        setSelectedEquipment(null); // Reset selected equipment after connection
      })
      .catch(error => {
        console.error('Error creating connection:', error);
      });
    } else {
      setSelectedEquipment(equip);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h3" mb="20px">Topologie</Typography>
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
        <Typography variant="h5">Équipements :</Typography>
        {equipmentList.map(equip => (
          <Box 
            key={equip._id} 
            mt="10px" 
            onClick={() => handleSelectEquipment(equip)}
            style={{ cursor: 'pointer', backgroundColor: selectedEquipment && selectedEquipment._id === equip._id ? 'lightgray' : 'white' }}
          >
            <Typography>Nom : {equip.Nom}</Typography>
            <Typography>Type : {equip.Type}</Typography>
            <Typography>Adresse IP : {equip.AdresseIp}</Typography>
            <Typography>RFID : {equip.RFID}</Typography>
            <Typography>Connecté à : {equip.ConnecteA.join(', ')}</Typography>
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
