import React, { useState, useEffect, useContext } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Link, useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import Tooltip from '@mui/material/Tooltip';
import { tokens } from "../../theme";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";


const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [equipData, setEquipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const navigate = useNavigate(); 
  const { enqueueSnackbar } = useSnackbar();
  const handlePingHistoryClick = (row) => {
    navigate(`/ping/${row.id}`);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/equip");
        const transformedData = response.data.map(row => ({
          ...row,
          id: row._id,  // Add an 'id' property with the value of '_id'
        }));
        setEquipData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      } 
    };
    fetchData();
  }, []);

  const handleButton1Click = (row) => {
    // Logic to handle button 1 action here
  };
  const handleButtonClick = async (row) => {
    // Si l'état de l'équipement est "réparation" ou "dysfonctionnel", affichez une alerte.
    if (row.Etat.toLowerCase() === 'reparation' || row.Etat.toLowerCase() === 'dysfonctionnel') {
      alert(`L'équipement est en ${row.Etat}. La configuration n'est pas possible pour le moment.`);
      return; // Arrêtez l'exécution supplémentaire dans ce cas
    }
  
    // Si l'état de l'équipement est fonctionnel, vérifiez s'il est déjà configuré
    try {
      const response = await axios.get(`http://localhost:3001/api/config/isConfigured/${row.id}`);
      if (response.data.isConfigured) {
        alert("L'équipement est déjà configuré.");
      } else {
        navigate(`/invoices/${row.id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la configuration:', error);
      alert('Impossible de vérifier si l’équipement est configuré.');
    }
  };

  const handleButton2Click = async (row) => {
    try {
      // Show a confirmation prompt
      const confirmDelete = window.confirm("Are you sure you want to delete this equipment?");
      if (!confirmDelete) {
        return;
      }
      const existingEquipment = equipData.find((equip) => equip.id === row.id);
      if (!existingEquipment) {
          console.error("Equipment not found in the current data.");
          return;
      }
      // Make sure the endpoint path matches
      await axios.delete(`http://localhost:3001/equip/${row.id}`);

      console.log('Equipment deleted successfully');
  
      // Filter out the deleted equipment from the current data
      const updatedData = equipData.filter((equip) => equip.id !== row.id);
      setEquipData(updatedData);
    } catch (error) {
      console.error("Error deleting equipment:", error);
  
      // Log more details about the Axios error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up the request:", error.message);
      }
  
      // After deletion or error, refetch the equipment data
      try {
        const updatedData = await axios.get("http://localhost:3001/equip");
        const transformedData = updatedData.data.map((row) => ({
          ...row,
          id: row._id,
        }));
        setEquipData(transformedData);
      } catch (fetchError) {
        console.error("Error fetching updated equipment data:", fetchError);
      }
    }
  };
  const handlePingButtonClick = async (row) => {
    const equipIp = row.AdresseIp;
    const equipId = row.id;
  
    try {
      const response = await axios.post(`http://localhost:3001/pingtest/manual`, { ip: equipIp, equipId });
  
      if (response.status === 200) {
        if (response.data.success) {
          enqueueSnackbar(`Ping successful for equipment with IP: ${equipIp}`, { variant: 'success' });
        } else {
          enqueueSnackbar(`Ping failed: ${response.data.message}`, { variant: 'error' });
        }
      } else {
        enqueueSnackbar(`Ping failed with status code: ${response.status}`, { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar("Error occurred while pinging equipment.", { variant: 'error' });
      console.error("Error pinging equipment:", error);
    }
  };     


  const renderActionCell = (params) => (
    <Box display="flex" justifyContent="center" alignItems="center" gap={0.3}>
      <Tooltip title="Modifier">
        <Button
          startIcon={<EditIcon />}
          onClick={() => navigate(`/modify/${params.row.id}`)}
          color="secondary"
          variant="contained"
          size="small"
          sx={{ padding: '5px 8px', minWidth: '15px', fontSize: '0.6rem' }} // Reducing padding and setting minimum width
          disabled={currentUser?.role === 'technicienReseau'}
          >
        
          Modifier
        </Button>
      </Tooltip>
  
      <Tooltip title="Supprimer">
        <Button
          startIcon={<DeleteIcon />}
          onClick={() => handleButton2Click(params.row)}
          color="secondary"
          variant="contained"
          size="small"
          sx={{ padding: '5px 8px', minWidth: '15px', fontSize: '0.6rem' }}
          disabled={currentUser?.role === 'technicienReseau'}
        >
          Supprimer
        </Button>
      </Tooltip>
  
      <Tooltip title="Ping">
        <Button
          startIcon={<WifiTetheringIcon />}
          onClick={() => handlePingButtonClick(params.row)}
          color="secondary"
          variant="contained"
          size="small"
          sx={{ padding: '5px 8px', minWidth: '15px', fontSize: '0.6rem' }}
        
        >
          Ping
        </Button>
      </Tooltip>
  
      <Tooltip title="Historique des Pings">
        <Button
          startIcon={<HistoryIcon />}
          component={Link}
          to={`/ping/${params.row.id}`}
          color="secondary"
          variant="contained"
          size="small"
          sx={{ padding: '5px 8px', minWidth: '15px', fontSize: '0.6rem' }}
        >
          Ping History
        </Button>
      </Tooltip>

      <Tooltip title="Configurer">
        <Button
          startIcon={<SettingsIcon />}
          onClick={() => handleButtonClick(params.row)}
          color="secondary"
          variant="contained"
          size="small"
          sx={{ padding: '5px 8px', minWidth: '15px', fontSize: '0.5rem' }}
          disabled={currentUser?.role === 'technicienReseau'}
        >
          Configurer
        </Button>
      </Tooltip>
    
    </Box>
  );
  
  const columns = [

    {
      field: "Nom",
      headerName: "Nom",
      flex: 1.25,
      headerAlign: "center",
      align: "center",
      cellClassName: "name-column--cell",
    },
    {
      field: "Type",
      headerName: "Type",
      type: "String",
      headerAlign: "center",
      align: "center",
      flex: 1.25,
    },
    {
      field: "AdresseIp",
      headerName: "Adresse IP",
      flex: 1.40,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "RFID",
      headerName: "RFID",
      flex: 1,
      headerAlign: "center",
      align: "center",
      cellClassName: "name-column--cell",
    },
    {
      field: "Emplacement",
      headerName: "Emplacement",
      type: "String",
      headerAlign: "center",
      align: "center",
      flex: 1.5,
    },
    {
      field: "Etat",
      headerName: "Etat",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "Actions",
      headerName: "Actions",
      flex: 5,
      headerAlign: "center",
      align: "center",
      renderCell: renderActionCell,
    },
  ];
  return (
    <Box m="20px">
      <Header title="Liste d'équipement "  />
      <Link to="/contacts">
      <Button 
        sx={{
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
          fontSize: "14px",
          fontWeight: "bold",
          padding: "10px 20px",
        }}  variant="contained"
        >
          Ajouter équipement
        </Button>
      </Link>
      
      
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
        rows={equipData}
        columns={columns}
        loading={loading}
        pageSize={8}
        getRowId={(row) => row.id} // Assurez-vous que `id` correspond à la clé unique dans vos données de ping
      />
    </div>
      </Box>
    </Box>
  );
};

export default Team;