import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import Graph from 'react-graph-vis';
import 'vis-network/styles/vis-network.css';
import io from 'socket.io-client';

const Topologie = () => {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
   // Ajoutez un état pour stocker les données des équipements avec leurs états
   const [equipments, setEquipments] = useState([]);
  const socket = io('https://nodeappectt.onrender.com'); // Assurez-vous que l'URL correspond à votre serveur

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

  
  useEffect(() => {
    const fetchTopologie = async () => {
      try {
        const response = await axios.get('https://nodeappectt.onrender.com/api/topologie');
        const visData = transformDataToVisNetwork(response.data);
        setGraph(visData);
        setEquipments(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement de la topologie réseau:', error);
      }
    };
    
    fetchTopologie();
  }, []);
  useEffect(() => {
    socket.on('newAlert', (newAlert) => {
      console.log('New alert received:', newAlert);
      const { equipmentId, status } = newAlert;
      updateEquipmentState(equipmentId, status);
    });

    return () => {
      socket.off('newAlert');
      socket.close();
    };
  }, []);

  const updateEquipmentState = (equipmentId, newState) => {
    setEquipments(prevEquipments =>
      prevEquipments.map(equip =>
        equip.id === equipmentId ? { ...equip, etat: newState } : equip
      )
    );

    const updatedGraph = transformDataToVisNetwork(equipments);
    setGraph(updatedGraph);
  };

  const transformDataToVisNetwork = (data) => {
    const nodes = [];
    const edges = [];
  
    data.forEach((equip) => {
        nodes.push({
          id: equip.id,
          label: `${equip.nom} (${equip.ip})`,
          title: `Type: ${equip.Type}\nEmplacement: ${equip.emplacement}\nEtat: ${equip.etat}`,
          shape: 'image', // Utiliser une forme d'image pour permettre l'utilisation d'icônes
          image: selectIconBasedOnType(equip.Type), 
          color: getColorByState(equip.etat),// Une fonction pour choisir l'icône basée sur le type d'équipement
        });
        
      // ConnecteA est un tableau des équipements auxquels cet équipement est connecté.
      equip.connecteA.forEach((connectedEquip) => {
        edges.push({
          from: equip.id,
          to: connectedEquip.id,
          label: equip.port, // Vous pouvez choisir de montrer ou non le port sur l'arête
        });
      });
    });
    return { nodes, edges };
};


  const getColorByState = (state) => {
    switch (state) {
      case 'dysfonctionnel':
        return '#FF0000'; // Rouge
      case 'Problème de réseau':
        return '#FFA500'; // Orange
      case 'En bon état':
        return '#008000'; // Vert
      default:
        return '#000000'; // Noir par défaut
    }
  };
  const options = {
    layout: {
      hierarchical: false
    },
    nodes: {
      shape: 'image',
      size: 30, // Réduisez la taille ici selon vos besoins
      borderWidth: 2,
      shapeProperties: {
        useImageSize: false,  // Si vous voulez une taille uniforme pour toutes les icônes, mettez cela à false
        useBorderWithImage: true
      }
    },
    edges: {
      color: "#000000"
    },
    height: "500px"
  };
  
  
    const events = {
      hoverNode: function(event) {
        var { nodes, edges } = event;
      }
    };
  
  return (
    <Box m="20px">
      <Typography variant="h4" mb={3}>
        Topologie Réseau
      </Typography>
      <Graph
  key={Date.now()} // force re-render
  graph={graph}
  options={options}
  events={events}
  style={{ height: "100%" }} // Utilisez 100% pour prendre toute la hauteur de Box
/>
    </Box>
  );
};

export default Topologie;
