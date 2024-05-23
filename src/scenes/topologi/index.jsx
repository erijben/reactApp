import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Graph from 'react-graph-vis';
import 'vis-network/styles/vis-network.css';
import DeleteIcon from '@mui/icons-material/Delete';

const Topologi = () => {
  const navigate = useNavigate();
  const [scannedEquipments, setScannedEquipments] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
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
          let newScannedEquipments = [...scannedEquipments];
          
          if (selectedEquipmentId) {
            const selectedEquipment = newScannedEquipments.find(equip => equip._id === selectedEquipmentId);
            if (selectedEquipment) {
              selectedEquipment.ConnecteA.push(scannedEquipment._id);
              try {
                await axios.put(`https://nodeapp-ectt.onrender.com/equip/equip/${selectedEquipment._id}`, selectedEquipment);
                setAlertMessage(`Connexion créée entre ${selectedEquipment.Nom} et ${scannedEquipment.Nom}`);
              } catch (updateError) {
                console.error('Error updating equipment:', updateError);
              }
            }
          }
          
          if (!newScannedEquipments.find(equip => equip._id === scannedEquipment._id)) {
            newScannedEquipments = [...newScannedEquipments, scannedEquipment];
          }

          setScannedEquipments(newScannedEquipments);
          setSelectedEquipmentId(null);
          updateGraph(newScannedEquipments);
          await axios.post('https://nodeapp-ectt.onrender.com/scannedEquipments', newScannedEquipments);
        } else {
          setAlertMessage('Équipement non trouvé');
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

  const updateGraph = (equipments) => {
    const nodes = equipments.map(equip => ({
      id: equip._id,
      label: equip.Nom,
      shape: 'image',
      image: selectIconBasedOnType(equip.Type),
      title: `Type: ${equip.Type}\nAdresse IP: ${equip.AdresseIp}\nRFID: ${equip.RFID}\nEtat: ${equip.Etat}`,
      color: getColorByState(equip.Etat)
    }));

    const edges = [];
    equipments.forEach(equip => {
      equip.ConnecteA.forEach(connectedId => {
        edges.push({
          from: equip._id,
          to: connectedId,
          arrows: 'to'
        });
      });
    });

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
    interaction: { selectConnectedEdges: false },
    manipulation: {
      enabled: true,
      addEdge: async (data, callback) => {
        if (data.from === data.to) {
          setAlertMessage('Vous ne pouvez pas connecter un équipement à lui-même.');
          setAlertOpen(true);
          return;
        }
        try {
          await axios.put(`https://nodeapp-ectt.onrender.com/equip/${data.from}`, {
            ConnecteA: [data.to]
          });
          const updatedEquipments = scannedEquipments.map(equip =>
            equip._id === data.from ? { ...equip, ConnecteA: [...equip.ConnecteA, data.to] } : equip
          );
          setScannedEquipments(updatedEquipments);
          updateGraph(updatedEquipments);
          await axios.post('https://nodeapp-ectt.onrender.com/scannedEquipments', updatedEquipments);
          callback(data);
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'équipement:', error);
        }
      }
    }
  };

  const events = {
    selectNode: (event) => {
      const { nodes } = event;
      setSelectedEquipmentId(nodes[0]);
      setAlertMessage(`Équipement sélectionné: ${nodes[0]}`);
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
            events={events}
            style={{ height: "500px" }}
          />
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

export default Topologi;
