import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { Autocomplete,Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/barChart";
import StatBox from "../../components/StatBox";
import { useEffect, useState } from "react";
import io from 'socket.io-client';
import axios from "axios";
import { NavLink } from 'react-router-dom';
import {TextField}  from '@mui/material';
import { Menu, MenuItem, FormGroup, FormControlLabel } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Importez l'icône appropriée
import { Alert, AlertTitle } from '@mui/material'; // Importez les composants Alert de MUI
import { useSnackbar } from 'notistack';
import TTLStatsPieChart from "../../components/Pie";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Dashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [alerts, setAlerts] = useState([]);
  const [resolvedAlertsCount, setResolvedAlertsCount] = useState(null); 
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [anchorEl, setAnchorEl] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [pingCount, setPingCount] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interventions, setInterventions] = useState([]);
  const [InterventionCount, setInterventionCount] = useState(null);
  const [barChartData, setBarChartData] = useState({});
  const [lineData, setLineData] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [exportFile, setExportFile] = useState(null);
  const socket = io('http://localhost:3000'); // Assurez-vous que l'URL correspond à votre serveur



  // Écoute de l'événement 'newAlert' pour recevoir les nouvelles alertes
socket.on('newAlert', (alert) => {
  // Mettez à jour votre interface utilisateur pour afficher la nouvelle alerte
  console.log('Nouvelle alerte reçue lors de l intervention:', alert);
  // Mettez à jour l'interface utilisateur avec l'alerte reçue
});
 
  // Vérifier si tous les équipements sont sélectionnés
  const isAllSelected = equipments.length > 0 && selectedEquipments.length === equipments.length;

  const fetchBarChartData = async () => {
    try {
      if (selectedEquipments.length > 0 && startDate && endDate) {
        const response = await axios.post('http://localhost:3001/api/barChartData', {
          startDate: startDate,
          endDate: endDate,
          equipmentIds: selectedEquipments
        });
  
        setBarChartData(response.data);
      } else {
        setBarChartData(null);
      }
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };


  
  useEffect(() => {
    if (selectedEquipments.length > 0 && startDate && endDate) {
      fetchPingCount();
      fetchBarChartData(); // Ajoutez cet appel
    } else {
      setPingCount(null);
      setBarChartData(null);
    }
  }, [selectedEquipments, startDate, endDate]);
  

  useEffect(() => {
    // Fonction pour charger la liste des équipements lorsque le composant est monté
    fetchEquipments();
  }, []);
  const handleClose = () => {
    
    setAnchorEl(null);
  };
  const handleCheckboxChange = async (event) => {
    const equipmentId = event.target.name;
    const isChecked = event.target.checked;
  
    setSelectedEquipments((prevState) => {
      if (isChecked) {
        return [...prevState, equipmentId];
      } else {
        return prevState.filter((id) => id !== equipmentId);
      }
    });
  };
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Sélectionner tous les équipements
      const allEquipmentIds = equipments.map((equipment) => equipment._id);
      setSelectedEquipments(allEquipmentIds);
    } else {
      // Désélectionner tous les équipements
      setSelectedEquipments([]);
    }
  };
  
  const handleStartDateChange = (event) => {
    const formattedDate = event.target.value;
    setStartDate(formattedDate);
  };
  
  const handleEndDateChange = (event) => {
    const formattedDate = event.target.value;
    setEndDate(formattedDate);
  };
  
  const fetchEquipments = async () => {
    try {
      
      const response = await axios.get('http://localhost:3001/equip');
      setEquipments(response.data);
    } catch (error) {
      console.error('Error fetching equipments:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/interventions");
        setInterventions(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    // Connexion à socket.io
    const socket = io('http://localhost:3001'); // Assurez-vous que l'adresse correspond à votre serveur socket.io

    // Gestion de la nouvelle alerte
    socket.on('newAlert', (newAlert) => {
      console.log('Nouvelle alerte reçue:', newAlert);
      let alertMessage = `Alerte: L'équipement ${newAlert.equipmentName || 'non spécifié'} est ${newAlert.status} après l'intervention.`;
      let notificationColor; // Définir la couleur de la notification

      switch (newAlert.status) {
        case 'dysfonctionnel':
          notificationColor = 'error';
          break;
        case 'Problème de réseau':
          notificationColor = 'warning';
          break;
        case 'En bon état':
          notificationColor = 'success';
          break;
        default:
          notificationColor = 'info';
          break;
      }
  
      // Ajoutez le message personnalisé à l'état des alertes
      setAlerts(currentAlerts => [
        ...currentAlerts,
        { ...newAlert, message: alertMessage }
      ]);

      // Affichez une notification avec la couleur appropriée
      enqueueSnackbar(alertMessage, { variant: notificationColor });
    });

    // Nettoyer l'écouteur d'événement lorsque le composant est démonté
    return () => {
      socket.off('newAlert');
      socket.close();
    };
  }, []);


  
  useEffect(() => {
    if (selectedEquipments.length > 0 && startDate && endDate) {
      fetchPingCount();
    } else {
      setPingCount(null);
    }
  }, [selectedEquipments, startDate, endDate]);
  
  const fetchPingCount = async () => {
    try {
      if (selectedEquipments.length > 0 && startDate && endDate) {
        const response = await axios.post('http://localhost:3001/api/pingResults/equip/count', {
          startDate: startDate,
          endDate: endDate,
          equipmentIds: selectedEquipments
        });
      // Calculer la somme du nombre total de pings pour tous les équipements sélectionnés
      const totalPingCount = Object.values(response.data.pingCounts).reduce((total, count) => total + count, 0);
      setPingCount(totalPingCount);
    } else {
      setPingCount(null);
    }
  } catch (error) {
    console.error('Error fetching ping count:', error);
  }
};
useEffect(() => {
  if (selectedEquipments.length > 0 && startDate && endDate) {
    fetchInterventionCount();
  } else {
    setInterventionCount(null);
  }
}, [selectedEquipments, startDate, endDate]);

const fetchInterventionCount = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/interventions/equip/count', {
      startDate: startDate,
      endDate: endDate,
      equipmentIds: selectedEquipments
    });

    if (response.data && response.data.interventionCounts) { // Modifier la propriété de la réponse
      const totalInterventionCount = Object.values(response.data.interventionCounts).reduce((total, count) => total + count, 0);
      setInterventionCount(totalInterventionCount);
    } else {
      setInterventionCount(null);
    }
  } catch (error) {
    console.error('Error fetching intervention count:', error);
  }
};
useEffect(() => {
  if (selectedEquipments.length > 0 && startDate && endDate) {
    fetchData();
  }
}, [selectedEquipments, startDate, endDate]);
const fetchData = async () => {
try {
  if (selectedEquipments.length > 0 && startDate && endDate) {
    const response = await axios.post("http://localhost:3001/api/erij", {
      startDate: startDate,
      endDate: endDate,
      equipmentIds: selectedEquipments
    });
    console.log('API response data:', response.data);
    setLineData(response.data);
  } else {
    // Réinitialiser les données du graphique si les conditions ne sont pas remplies
    setLineData([]);
  }
} catch (error) {
  console.error("Error fetching data:", error);
}
};

useEffect(() => {
  if (selectedEquipments.length > 0 && startDate && endDate) {
    fetchInterventions();
  }
}, [selectedEquipments, startDate, endDate]);

const fetchInterventions = async () => {
  try {
    if (selectedEquipments.length > 0 && startDate && endDate) {
      const response = await axios.post('http://localhost:3001/api/interventions/filter', {
        startDate: startDate,
        endDate: endDate,
        equipmentIds: selectedEquipments
      });
      setInterventions(response.data);
    } else {
      // Réinitialiser les interventions si les conditions ne sont pas remplies
      setInterventions([]);
    }
  } catch (error) {
    console.error('Error fetching interventions:', error);
  }
};

// Mettez à jour la fonction fetchResolvedAlertsCount pour envoyer une requête POST
const fetchResolvedAlertsCount = async () => {
  if (selectedEquipments.length > 0 && startDate && endDate) {
    try {
      const response = await axios.post('http://localhost:3001/api/alerts/resolved/count', {
        startDate: startDate,
        endDate: endDate,
        equipmentIds: selectedEquipments
      });
      setResolvedAlertsCount(response.data.resolvedAlertCount);
    } catch (error) {
      console.error('Error fetching resolved alerts count:', error);
    }
  }
};


useEffect(() => {
  fetchResolvedAlertsCount();
}, [selectedEquipments, startDate, endDate]); // Dépendances pour recharger le compte lors de leur changement


// Fonction pour générer le rapport
const generateAndDownloadReport = async (format) => {
  setIsGenerating(true);
  try {
    const response = await axios.post('http://localhost:3001/api/reports/generate', {
      startDate, endDate, equipmentIds: selectedEquipments,
    });
    setIsGenerating(false);
    // Vous devrez peut-être ajuster les chemins d'accès en fonction de la réponse de votre API
    if (format === 'pdf' && response.data.pdfFilePath) {
      window.open(response.data.pdfFilePath, '_blank');
    } else {
      console.error('Failed to generate report: No file path returned');
    }
  } catch (error) {
    console.error('Error generating report:', error);
    setIsGenerating(false);
  }
};


// This function triggers the download of the report
const downloadFile = (filePath) => {
  // The filePath should be the URL to access the generated report
  window.open(filePath, '_blank');
};

const generateSummary = async () => {
  // Vous pouvez utiliser un appel API ici pour obtenir les données
  const response = await axios.get("/api/some-endpoint");
  const data = response.data;

  // Générez le résumé en fonction des données
  let summary = "Lors de ces interventions, ";
  data.forEach((item, index) => {
    summary += `pour l'équipement ${item.equipmentName}, `;
    if (item.pingCount === 0) {
      summary += "aucune anomalie détectée ";
    } else {
      summary += `latence observée de ${item.latency} ms `;
    }
    if (index < data.length - 1) {
      summary += "; ";
    }
  });
  summary += ".";
  setReportSummary(summary);
};

return (
    <Box m="20px">
     <Box sx={{ position: 'fixed', bottom: 0, right: 0, m: 2 }}>
  
</Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <Box gridColumn="span 12" p="20px">
        <Typography variant="h6" color="inherit">
  Alertes récentes
</Typography>
{alerts.map((alert, index) => (
  <Alert
    key={index}
    severity={alert.notificationColor} // Utilisation de la couleur assignée dans l'écouteur socket
    icon={<ErrorOutlineIcon fontSize="inherit" />}
    sx={{ my: 2 }}
  >
    {alert.message} 
  </Alert>
))}
</Box>
       
<Box
      display="flex"
      alignItems="center"
      color="text.primary"
      fontSize="14px"
      fontWeight="bold"
      p="10px 20px"
      borderRadius="5px"
    >
      <TextField
        id="startDate"
        label="Date début"
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ mr: 2, "& .MuiInputLabel-root": { color: colors.grey[100] } }}
        InputProps={{
          style: {
            color: colors.grey[100],
          },
        }}
      />
      <TextField
        id="endDate"
        label="Date fin"
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ mr: 2, "& .MuiInputLabel-root": { color: colors.grey[100] } }}
        InputProps={{
          style: {
            color: colors.grey[100],
          },
        }}
      />
   <Autocomplete
  multiple
  id="checkboxes-tags-demo"
  options={equipments}  // Vos équipements chargés depuis l'API
  disableCloseOnSelect
  getOptionLabel={(option) => option.Nom}  // Assurez-vous que 'Nom' est la propriété contenant le nom de l'équipement
  renderOption={(props, option, { selected }) => (
    <li {...props}>
      <Checkbox
        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
        checkedIcon={<CheckBoxIcon fontSize="small" />}
        style={{ marginRight: 8 }}
        checked={selected}
      />
      {option.Nom}
    </li>
  )}
  style={{ width: 500 }}
  renderInput={(params) => (
    <TextField {...params} label="Rechercher et sélectionner des équipements" placeholder="Équipements" />
  )}
  value={selectedEquipments.map(id => equipments.find(e => e._id === id))}
  onChange={(event, newValue) => {
    setSelectedEquipments(newValue.map(item => item._id));
  }}
/>
   <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={isAllSelected} onChange={handleSelectAll} />}
          label=""
        />
      </FormGroup>

 
    </Box>

      </Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
      
       
          
 
        
        <Box
  gridColumn="span 4"
  backgroundColor={colors.primary[400]}
  display="flex"
  alignItems="center"
  justifyContent="center"
>
<StatBox
    title={pingCount !== null ? pingCount:"-"} // Utiliser le nombre de ping de l'équipement sélectionné
    subtitle="Nombre de ping"
    progress="0.80"
    increase="" // pourcentage
    icon={
      <TrafficIcon
        sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
      />
    }
  />

</Box>
{
  reportSummary && (
    <Typography variant="body1" gutterBottom>
      {reportSummary}
    </Typography>
  )
}
<Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
  <StatBox
  title={InterventionCount !== null ? InterventionCount : "-"}
  subtitle="Nombre des interventions"
  progress=""
  increase=""
  icon={
    <PersonAddIcon
      sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
    />
  }
  
/>
        </Box>  
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={resolvedAlertsCount !== null ? resolvedAlertsCount : "-"}
            subtitle=" Alertes résolues"
            progress="0.50"
            increase="+21%"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>    
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
             <Box>
  

  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose} // This will just close the menu without clearing selections
  >
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={selectedEquipments.length === equipments.length}
            onChange={handleSelectAll}
            name="selectAll"
          />
        }
        label="Select All"
      />
    
      {equipments.map((equipment) => (
        <FormControlLabel
          key={equipment._id}
          control={
            <Checkbox
              checked={selectedEquipments.includes(equipment._id)}
              onChange={handleCheckboxChange}
              name={equipment._id}
            />
          }
          label={equipment.Nom}
        />
      ))}
    </FormGroup>
    <MenuItem onClick={handleClose}>Done</MenuItem>
  </Menu>
</Box>
<Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Courbe
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                TTL
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
          <Box height="250px" m="-20px 0 0 0">
          <LineChart
  isDashboard={false}
  selectedEquipments={selectedEquipments}
  startDate={startDate}
  endDate={endDate}
/>
</Box>

          </Box>
        </Box>
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} overflow="auto">
        <div style={{ display: 'flex', gap: '10px' }}> 
  
  <Button
    sx={{
      backgroundColor: colors.blueAccent[700],
      color: colors.grey[100],
      fontSize: "14px",
      fontWeight: "bold",
      padding: "10px 20px",
      justifyContent:"center", // Centrez horizontalement
    alignItems:"center",
    }}
    onClick={() => generateAndDownloadReport('pdf')}
    disabled={isGenerating}
  >
    {isGenerating ? 'Génération rapport en cours...' : 'Télécharger rapport en  PDF'}
  </Button>
</div>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
              
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
      Dernières interventions
    </Typography>
    <NavLink to="/listes">
      Voir toutes
    </NavLink>
  </Box>
  {interventions.slice(0, 5).map((intervention) => (
    <Box key={intervention._id} py="5px">
      <Typography color={colors.grey[100]}>
        {intervention.type} - {new Date(intervention.date).toLocaleDateString("fr-FR")}
      </Typography>
      <NavLink to={`/listes/${intervention._id}`}>
        Voir détails
      </NavLink>
    </Box>
  ))}
</Box>
<Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            PieChart
          </Typography>
          <Box height="250px" mt="-20px">
          <TTLStatsPieChart
  isDashboard={false}
  equipmentIds={selectedEquipments}
  startDate={startDate}
  endDate={endDate}

/>
          </Box>
        </Box>
      
       
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
          </Typography>
          <Box height="250px" mt="-20px">
          {selectedEquipments.length > 0 ? (
      <BarChart
        equipmentIds={selectedEquipments}
        startDate={startDate}
        endDate={endDate}
        isDashboard={true}
      />
    ) : (
      <Typography variant="body2">Aucun équipement sélectionné pour afficher le graphique.</Typography>
    )}
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default Dashboard;