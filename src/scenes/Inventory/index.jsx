import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Graph from 'react-graph-vis';
import 'vis-network/styles/vis-network.css';
import DeleteIcon from '@mui/icons-material/Delete';

const Inventory = () => {
  const navigate = useNavigate();
  const [scannedEquipments, setScannedEquipments] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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

  useEffect(() => {
    const interval = setInterval(fetchScannedEquipments, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchScannedEquipments = async () => {
    try {
      const response = await axios.get('https://nodeapp-ectt.onrender.com/scannedEquipments');
      setScannedEquipments(response.data);
      updateGraph(response.data);
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
        const scannedEquipment = equipmentList.find(equip => equip.RFID === rfid);
        if (scannedEquipment) {
          if (scannedEquipments.some(equip => equip._id === scannedEquipment._id)) {
            setAlertMessage(`L'équipement ${scannedEquipment.Nom} est déjà scanné.`);
            setAlertOpen(true);
            return;
          }

          if (scannedEquipments.length > 0) {
            const lastScannedEquipment = scannedEquipments[scannedEquipments.length - 1];
            const updatedConnecteA = [...lastScannedEquipment.ConnecteA, scannedEquipment._id];
            try {
              await axios.put(`https://nodeapp-ectt.onrender.com/equip/equip/${lastScannedEquipment._id}`, { ConnecteA: updatedConnecteA });
            } catch (updateError) {
              console.error('Error updating equipment:', updateError);
            }
          }

          const newScannedEquipments = [...scannedEquipments, scannedEquipment];
          setScannedEquipments(newScannedEquipments);
          updateGraph(newScannedEquipments);
          await axios.post('https://nodeapp-ectt.onrender.com/scannedEquipments', newScannedEquipments);
        } else {
          console.error('Équipement non trouvé');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du tag RFID:', error);
    }
  };

  const handleRemoveEquipment = async (id) => {
    try {
      const newScannedEquipments = scannedEquipments.filter(equip => equip._id !== id);
      setScannedEquipments(newScannedEquipments);
      updateGraph(newScannedEquipments);
      await axios.post('https://nodeapp-ectt.onrender.com/scannedEquipments', newScannedEquipments);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipement:', error);
    }
  };
  const handleFinishInventory = async () => {
    try {
      console.log('Scanned Equipments:', scannedEquipments);
      const scannedEquipmentIds = scannedEquipments.map(equip => equip._id);
      const response = await axios.post('https://nodeapp-ectt.onrender.com/inventory/finish', {
        scannedEquipments: scannedEquipmentIds,
      });
      console.log('Response:', response.data);
      setAlertMessage(`Inventaire terminé avec succès. Nombre d'équipements scannés: ${response.data.count}`);
      setAlertOpen(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la terminaison de l\'inventaire:', error);
      setAlertMessage('Erreur lors de la terminaison de l\'inventaire');
      setAlertOpen(true);
    }
  };
  

  const updateGraph = (equipments) => {
    const nodes = equipments.map(equip => ({
      id: equip._id,
      label: equip.Nom,
      shape: 'image',
      image: selectIconBasedOnType(equip.Type),
      title: `Type: ${equip.Type}\nAdresse IP: ${equip.AdresseIp}\nRFID: ${equip.RFID}\nEtat: ${equip.Etat}`,
      color: getColorByState(equip.Etat)
    }));

    const edges = equipments.slice(1).map((equip, index) => ({
      from: equipments[index]._id,
      to: equip._id,
      arrows: 'to'
    }));

    setGraph({ nodes, edges });
  };

  const selectIconBasedOnType = (type) => {
    switch (type) {
      case 'router':
        return `${process.env.PUBLIC_URL}/icons/router.png`;
      case 'switch':
        return `${process.env.PUBLIC_URL}/icons/switch.png`;
      case 'computer':
        return `${process.env.PUBLIC_URL}/icons/computer.png`;
      default:
        return `${process.env.PUBLIC_URL}/icons/default.png`;
    }
  };

  const getColorByState = (state) => {
    switch (state) {
      case 'dysfonctionnel':
        return 'red';
      case 'Problème de réseau':
        return 'orange';
      case 'En bon état':
        return 'green';
      default:
        return 'blue';
    }
  };

  const options = {
    layout: {
      hierarchical: false
    },
    nodes: {
      shape: 'image',
      size: 30,
      borderWidth: 2,
      shapeProperties: {
        useImageSize: false,
        useBorderWithImage: true
      }
    },
    edges: {
      color: "#000000",
      arrows: {
        to: { enabled: true, scaleFactor: 1 }
      }
    },
    height: "500px"
  };

  return (
    <Box m="20px">
      <Typography variant="h3" mb="20px">Inventaire</Typography>
      <Button variant="contained" color="primary" onClick={handleRFIDScan}>
        Scanner RFID
      </Button>
      {scannedEquipments.length > 0 && (
        <Box mt="20px">
          <Typography variant="h5">Équipements scannés :</Typography>
          {scannedEquipments.map((equip) => (
            <Box key={equip._id} display="flex" alignItems="center" mt="10px">
              <Typography>
                Nom: {equip.Nom}
              </Typography>
              <IconButton onClick={() => handleRemoveEquipment(equip._id)} color="secondary">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Graph
            key={Date.now()}
            graph={graph}
            options={options}
            style={{ height: "500px" }}
          />
          <Button variant="contained" color="primary" onClick={handleFinishInventory} style={{ marginTop: '20px' }}>
            Terminer l'inventaire
          </Button>
        </Box>
      )}
      <Button variant="contained" color="secondary" onClick={() => navigate('/dashboard')} mt="20px">
        Retour au Dashboard
      </Button>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
      />
    </Box>
  );
};

export default Inventory;