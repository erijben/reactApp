
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
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import { NavLink } from 'react-router-dom';
import {TextField}  from '@mui/material';
import { Menu, MenuItem, FormGroup, FormControlLabel } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Importez l'icône appropriée
import { Alert, AlertTitle } from '@mui/material'; // Importez les composants Alert de MUI
import { useSnackbar } from 'notistack';
import TTLStatsPieChart from "../../components/Pie";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import html2canvas from 'html2canvas';
import CollapsibleAlertBox from '../../components/CollapsibleAlertBox'; 
pdfMake.vfs = pdfFonts.pdfMake.vfs;


const Dashboard = () => {
  const captureAndDownloadPDF = async () => {
    try {
        const canvas = await html2canvas(document.querySelector("#dashboard"));
        const imageData = canvas.toDataURL('image/png');
        
        const docDefinition = {
            content: [
                { text: 'Rapport du Dashboard', style: 'header' },
                { text: 'Résumé des indicateurs clés', style: 'subheader' },
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: `Nombre de pings: ${pingCount !== null ? pingCount : "-"}` },
                                { text: `Nombre des interventions: ${InterventionCount !== null ? InterventionCount : "-"}` },
                                { text: `Alertes résolues: ${resolvedAlertsCount !== null ? resolvedAlertsCount : "-"}` },
                            ]
                        }
                    ]
                },
                { text: 'Équipement(s) sélectionné(s)', style: 'subheader' },
                {
                    ul: selectedEquipments.map(id => {
                        const equip = equipments.find(e => e._id === id);
                        return equip ? equip.Nom : "Équipement non spécifié";
                    })
                },
                { text: 'Plage de dates', style: 'subheader' },
                { text: `Début: ${startDate}`, margin: [0, 0, 0, 10] },
                { text: `Fin: ${endDate}`, margin: [0, 0, 0, 10] },
                { text: 'Graphiques et analyses', style: 'subheader' },
                {
                    image: imageData,
                    width: 500
                },
                { text: 'Interprétation des résultats', style: 'subheader' },
                {
                    ul: [
                        'Les pings sont réguliers et montrent une bonne stabilité de la connexion.',
                        'Le nombre d\'interventions est cohérent avec les alertes reçues.',
                        'Aucune alerte résolue pour cette période, nécessitant peut-être une analyse plus approfondie.'
                    ]
                },
                { text: 'Détails des interventions récentes', style: 'subheader' },
                {
                    table: {
                        body: [
                            ['Type', 'Date', 'Détails'],
                            ...interventions.slice(0, 5).map(intervention => [
                                intervention.type,
                                new Date(intervention.date).toLocaleDateString("fr-FR"),
                                { text: 'Voir détails', link: `http://localhost:3000/listes/${intervention._id}`, style: 'link' }
                            ])
                        ]
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 22,
                    bold: true
                },
                subheader: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                link: {
                    color: 'blue',
                    decoration: 'underline'
                }
            }
        };
        
        pdfMake.createPdf(docDefinition).download('dashboard-report.pdf');
    } catch (error) {
        console.error('Failed to capture and generate PDF:', error);
    }
};
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
  const socket = io('http://localhost:3001'); // Assurez-vous que l'URL correspond à votre serveur
  const [isLoading, setIsLoading] = useState(false);


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
        const response = await axios.post('https://nodeapp-ectt.onrender.com/api/barChartData', {
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
      
      const response = await axios.get('https://nodeapp-ectt.onrender.com/equip');
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
        const response = await axios.get("https://nodeapp-ectt.onrender.com/api/interventions");
        setInterventions(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('newAlert', (newAlert) => {
      console.log('Nouvelle alerte reçue:', newAlert);
      let alertMessage = '';
      let notificationColor;
  
      // Distinguez entre les types d'alerte
      if (newAlert.alertType === 'Automatique') {
        // Personnalisez le message pour une alerte automatique
        alertMessage = `Surveillance Automatique: ${newAlert.equipmentName || 'Équipement non spécifié'} - ${newAlert.message}`;
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
      } else if (newAlert.alertType === 'Intervention') {
        // Personnalisez le message pour une alerte de post-intervention
        alertMessage = `Post-Intervention: ${newAlert.equipmentName || 'Équipement non spécifié'} - ${newAlert.message}`;
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
      }
  
      // Mise à jour de l'état des alertes avec le nouveau message et la couleur
      setAlerts(currentAlerts => [
        ...currentAlerts,
        { ...newAlert, message: alertMessage, notificationColor }
      ]);
  
      // Afficher la notification avec snackbar
      enqueueSnackbar(alertMessage, { variant: notificationColor });
    });
    return () => {
      socket.off('newAlert');
      socket.close();
    };
  }, [enqueueSnackbar]);

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
        const response = await axios.post('https://nodeapp-ectt.onrender.com/api/pingResults/equip/count', {
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
    const response = await axios.post('https://nodeapp-ectt.onrender.com/api/interventions/equip/count', {
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
  }};

useEffect(() => {
  if (selectedEquipments.length > 0 && startDate && endDate) {
    fetchData();
  }
}, [selectedEquipments, startDate, endDate]);
const fetchData = async () => {
try {
  if (selectedEquipments.length > 0 && startDate && endDate) {
    const response = await axios.post("https://nodeapp-ectt.onrender.com/api/erij", {
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
      const response = await axios.post('https://nodeapp-ectt.onrender.com/api/interventions/filter', {
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
      const response = await axios.post('https://nodeapp-ectt.onrender.com/api/alerts/resolved/count', {
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
    const response = await axios.post('https://nodeapp-ectt.onrender.com/api/reports/generate', {
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

useEffect(() => {
  // Fonction pour supprimer l'alerte après 45 secondes
  const removeAlertAfterTimeout = (index) => {
    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
    }, 200000); // 45 secondes
  };

  // Ajoutez les alertes et configurez leur suppression après 45 secondes
  alerts.forEach((_, index) => removeAlertAfterTimeout(index));
}, [alerts]); // Exécutez cet effet chaque fois que les alertes changent


return (
 <div id="dashboard">
    <Box m="20px">
     <Box sx={{ position: 'fixed', bottom: 0, right: 0, m: 2 }}> 
</Box>
  <Box display="flex" justifyContent="space-between" alignItems="center">
     <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <CollapsibleAlertBox alerts={alerts} />
        <Box gridColumn="span 12" p="20px">
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
        style={{ marginRight: 5 }}
        checked={selected}
      />
      {option.Nom}
    </li>
  )}
  style={{ width: 250 }}
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
<button 
  onClick={captureAndDownloadPDF} 
  style={{ 
    backgroundColor: colors.blueAccent[700], 
    color: colors.grey[300], 
    fontSize: '14px', 
    fontWeight: 'bold', 
    padding: '10px 20px', 
    borderRadius: '5px', 
    cursor: 'pointer' 
  }}
>
  Télécharger le rapport PDF
</button>
<Box>
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
   
    increase="" // pourcentage
    icon={
      <WifiTetheringIcon 
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
  
 
  icon={
    <AddCircleOutlineIcon 
    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}/>
   
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

            icon={
              <NotificationsOutlinedIcon 
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

              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
               LineChart
              </Typography>
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
      color: colors.grey[300],
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
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
         <Typography
            variant="h5"
            fontWeight="bold"
            color={colors.greenAccent[500]}
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
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
           <Typography
            variant="h5"
            fontWeight="bold"
            color={colors.greenAccent[500]}
            sx={{ padding: "30px 30px 0 30px" }}
          >
            BarChart
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
      <Typography variant="body2"></Typography>
    )}
    </Box>
  </Box>
</Box>
</Box>
</div>
);
};

export default Dashboard;