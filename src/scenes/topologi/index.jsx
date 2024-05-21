import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, MenuItem, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Graph from 'react-graph-vis';
import 'vis-network/styles/vis-network.css';

const Topologi = () => {
  const navigate = useNavigate();
  const [scannedEquipments, setScannedEquipments] = useState([]);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [targetEquipment, setTargetEquipment] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchScannedEquipments = async () => {
      try {
        const response = await axios.get('https://nodeapp-ectt.onrender.com/scannedEquipments');
        setScannedEquipments(response.data);
        updateGraph(response.data);
      } catch (error) {
        console.error('Error fetching scanned equipments:', error);
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(fetchScannedEquipments, 5000);
    fetchScannedEquipments();

    return () => clearInterval(interval);
  }, []);

  const handleRFIDScan = async () => {
    if ("NDEFReader" in window) {
      try {
        const reader = new NDEFReader();
        await reader.scan();
        reader.onreading = async (event) => {
          const serialNumber = event.serialNumber;
          if (serialNumber) {
            setAlertMessage(`RFID scanné avec succès: ${serialNumber}`);
            const response = await axios.get(`https://nodeapp-ectt.onrender.com/equip/find/${serialNumber}`);
            if (response.data.success) {
              const newEquipment = response.data.equipment;
              setScannedEquipments((prevEquipments) => {
                const updatedEquipments = [...prevEquipments, newEquipment];
                updateGraph(updatedEquipments);
                return updatedEquipments;
              });
              await axios.post('https://nodeapp-ectt.onrender.com/scannedEquipments', [...scannedEquipments, newEquipment]);
            } else {
              setAlertMessage(`Équipement non trouvé pour RFID: ${serialNumber}`);
            }
          } else {
            setAlertMessage("Aucune donnée scannée.");
          }
        };
      } catch (error) {
        setAlertMessage(`Erreur de lecture du tag NFC: ${error.message}`);
      }
    } else {
      setAlertMessage("NFC n'est pas supporté sur cet appareil ou navigateur.");
    }
  };

  const handleEquipmentClick = (equipmentId) => {
    const equipment = scannedEquipments.find(equip => equip._id === equipmentId);
    setSelectedEquipment(equipment);
  };

  const handleConnectEquipments = async () => {
    if (selectedEquipment && targetEquipment) {
      try {
        const response = await axios.put(`https://nodeapp-ectt.onrender.com/equip/equip/${selectedEquipment._id}`, {
          ConnecteA: [...selectedEquipment.ConnecteA, targetEquipment]
        });

        if (response.data.success) {
          const updatedEquipment = response.data.data;
          setScannedEquipments((prevEquipments) => {
            const updatedEquipments = prevEquipments.map(equip =>
              equip._id === updatedEquipment._id ? updatedEquipment : equip
            );
            updateGraph(updatedEquipments);
            return updatedEquipments;
          });
          setAlertMessage('Équipements connectés avec succès');
        }
      } catch (error) {
        setAlertMessage(`Erreur lors de la connexion des équipements: ${error.message}`);
      }
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

    const edges = equipments.reduce((acc, equip) => {
      if (equip.ConnecteA && equip.ConnecteA.length > 0) {
        equip.ConnecteA.forEach(conn => {
          acc.push({ from: equip._id, to: conn, arrows: 'to' });
        });
      }
      return acc;
    }, []);

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
    height: "500px",
    interaction: {
      selectable: true,
      selectConnectedEdges: false,
    },
    manipulation: {
      enabled: true,
      initiallyActive: true,
    },
  };

  const events = {
    selectNode: (event) => {
      const { nodes } = event;
      setSelectedEquipment(nodes[0]);
      setAlertMessage(`Équipement sélectionné: ${nodes[0]}`);
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
        <Graph
          key={Date.now()}
          graph={graph}
          options={options}
          events={events}
          style={{ height: "500px" }}
        />
        {selectedEquipment && (
          <Box mt="20px">
            <Typography variant="h6">Équipement sélectionné :</Typography>
            <Typography>Nom: {selectedEquipment.Nom}</Typography>
            <Typography>Type: {selectedEquipment.Type}</Typography>
            <Typography>Adresse IP: {selectedEquipment.AdresseIp}</Typography>
            <Typography>RFID: {selectedEquipment.RFID}</Typography>
            <Typography>État: {selectedEquipment.Etat}</Typography>
            <Typography>Emplacement: {selectedEquipment.Emplacement}</Typography>
            <Select
              value={targetEquipment}
              onChange={(e) => setTargetEquipment(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>
                Sélectionner un équipement pour la connexion
              </MenuItem>
              {scannedEquipments
                .filter(equip => equip._id !== selectedEquipment._id)
                .map(equip => (
                  <MenuItem key={equip._id} value={equip._id}>
                    {equip.Nom}
                  </MenuItem>
                ))}
            </Select>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConnectEquipments}
              disabled={!targetEquipment}
            >
              Connecter l'équipement
            </Button>
          </Box>
        )}
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
