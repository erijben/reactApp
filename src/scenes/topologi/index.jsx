import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, MenuItem, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Graph from 'react-graph-vis';
import 'vis-network/styles/vis-network.css';
import io from 'socket.io-client';
import { useSnackbar } from 'notistack';

const Topologi = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [scannedEquipments, setScannedEquipments] = useState([]);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [targetEquipment, setTargetEquipment] = useState('');

  const socket = io('https://nodeapp-ectt.onrender.com'); // Utilisez l'URL de votre backend déployé

  useEffect(() => {
    socket.on('newEquipment', (newEquipment) => {
      console.log('New equipment received:', newEquipment); // Console log
      setScannedEquipments((prevEquipments) => {
        const updatedEquipments = [...prevEquipments, newEquipment];
        updateGraph(updatedEquipments);
        return updatedEquipments;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  const handleRFIDScan = async () => {
    if ("NDEFReader" in window) {
      try {
        const reader = new NDEFReader();
        await reader.scan();
        reader.onreading = async (event) => {
          const serialNumber = event.serialNumber;
          if (serialNumber) {
            enqueueSnackbar(`RFID scanné avec succès: ${serialNumber}`, { variant: 'success' });
            const response = await axios.get(`https://nodeapp-ectt.onrender.com/equip/find/${serialNumber}`);
            if (response.data.success) {
              const newEquipment = response.data.equipment;
              setScannedEquipments((prevEquipments) => {
                const updatedEquipments = [...prevEquipments, newEquipment];
                updateGraph(updatedEquipments);
                return updatedEquipments;
              });
              socket.emit('newEquipment', newEquipment); // Notify all clients about the new equipment
            } else {
              enqueueSnackbar(`Équipement non trouvé pour RFID: ${serialNumber}`, { variant: 'error' });
            }
          } else {
            enqueueSnackbar("Aucune donnée scannée.", { variant: 'warning' });
          }
        };
      } catch (error) {
        enqueueSnackbar(`Erreur de lecture du tag NFC: ${error.message}`, { variant: 'error' });
      }
    } else {
      enqueueSnackbar("NFC n'est pas supporté sur cet appareil ou navigateur.", { variant: 'warning' });
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
          enqueueSnackbar('Équipements connectés avec succès', { variant: 'success' });
        }
      } catch (error) {
        enqueueSnackbar(`Erreur lors de la connexion des équipements: ${error.message}`, { variant: 'error' });
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
      selectConnectedEdges: false,
      selectNode: ({ nodes }) => handleEquipmentClick(nodes[0])
    }
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
          <Graph
            key={Date.now()}
            graph={graph}
            options={options}
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
      )}
      <Button variant="contained" color="secondary" onClick={() => navigate('/dashboard')} mt="20px">
        Retour au Dashboard
      </Button>
    </Box>
  );
};

export default Topologi;
