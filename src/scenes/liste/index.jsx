import React, { useState, useEffect } from 'react';
import { Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import axios from "axios";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const Liste = () => {
  const { id } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [interventions, setInterventions] = useState([]);
  const [nfcSupported, setNfcSupported] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if ("NDEFReader" in window) {
      setNfcSupported(true);
      console.log("NFC supporté");
    } else {
      setNfcSupported(false);
      enqueueSnackbar("NFC n'est pas supporté sur cet appareil ou navigateur.", { variant: 'warning' });
      console.log("NFC non supporté");
    }
  }, [enqueueSnackbar]);

  const readNfcTagForIntervention = async () => {
    if (nfcSupported) {
      try {
        const reader = new NDEFReader();
        await reader.scan();
        console.log("En attente de la lecture du tag NFC...");

        reader.onreading = async event => {
          console.log("Tag NFC détecté !");
          const serialNumber = event.serialNumber;
          if (serialNumber) {
            console.log("Numéro de série du tag NFC:", serialNumber);

            // Rechercher l'équipement dans la base de données en utilisant le RFID scanné
            try {
              const response = await axios.get(`https://nodeapp-ectt.onrender.com/equip/find/${serialNumber}`);
              if (response.data.success) {
                const equipment = response.data.equipment;
                navigate('/intervention', { state: { equipmentName: equipment.Nom } });
              } else {
                enqueueSnackbar("Équipement non trouvé.", { variant: 'error' });
              }
            } catch (error) {
              console.error('Erreur lors de la recherche de l\'équipement :', error);
              enqueueSnackbar("Erreur lors de la recherche de l'équipement.", { variant: 'error' });
            }
          } else {
            console.error("Aucune donnée scannée.");
            enqueueSnackbar("Aucune donnée scannée.", { variant: 'warning' });
          }
        };
      } catch (error) {
        console.error(`Erreur de lecture du tag NFC: ${error.message}`);
        enqueueSnackbar(`Erreur de lecture du tag NFC: ${error.message}`, { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://nodeapp-ectt.onrender.com/api/interventions");
        console.log(response.data);
        setInterventions(response.data);

        const equippedInterventions = await Promise.all(response.data.map(async (intervention) => {
          try {
            const equipResponse = await axios.get(`https://nodeapp-ectt.onrender.com/api/interventions/equip/${intervention.equipment}`);
            if (equipResponse.data && equipResponse.data.Nom) {
              intervention.equipmentName = equipResponse.data.Nom;
            } else {
              intervention.equipmentName = 'Unavailable';
            }
            return intervention;
          } catch (error) {
            console.error('Failed to fetch equipment details:', error);
            intervention.equipmentName = 'Unavailable';
            return intervention;
          }
        }));
        setInterventions(equippedInterventions);
      } catch (error) {
        console.error("Error fetching interventions:", error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: "equipmentName", headerName: "Equipment", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
   
    { field: 'description', headerName: "Description", flex: 1 },
    { field: "parentIntervention", headerName: 'Parent Intervention', flex: 1 },
  ];

  return (
    <Box m="20px">
      <Header title="Liste des interventions" />
      <Box display="flex" gap="20px" mb="20px">
      
        <Button
          onClick={readNfcTagForIntervention}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
          variant="contained"
        >
          Scanner RFID pour Intervention
        </Button>
      </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <div style={{ height: 450, width: '100%' }}>
          <DataGrid
            rows={interventions}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row._id}
          />
        </div>
      </Box>
    </Box>
  );
};

export default Liste;