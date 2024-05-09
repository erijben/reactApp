import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import axios from "axios";
import { useParams } from "react-router-dom";
import { tokens } from "../../theme";


const Ping = () => {
  const { equipmentId } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pingResults, setPingResults] = useState([]);
  // Récupérer l'ID de l'équipement depuis l'URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!equipmentId) {
          console.error('Equipment ID is undefined');
          return;
        }
        
        const response = await axios.get(`http://localhost:3001/api/pingResults/equip/${equipmentId}`);
        if (response.status === 200) {
          const data = response.data;
          console.log('Ping Results:', data);
          setPingResults(data);
        } else {
          console.error('Error fetching data. HTTP Status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [equipmentId]);
  // Utiliser l'ID de l'équipement comme dépendance du useEffect

  const columns = [
    {
      field: "ID",
      headerName: "ID",
      flex: 2,
      cellClassName: "name-column--cell",
    },
    {
      field: "size",
      headerName: "Size",
      flex: 2,
      cellClassName: "name-column--cell",
    },
 
    {
      field: "TTL",
      headerName: "TTL",
      type: "[number]",
      headerAlign: "left",
      align: "left",
      width: 50,
      flex: 2,
    },
 
    {
      field: "latency",
      headerName: "latency",
      type: "[number]",
      headerAlign: "left",
      align: "left",
      width: 50,
      flex: 2,
    },
    {
      field: "packetsSent",
      headerName: "Packets Sent",
      type: 'number',
      width: 100,
      cellClassName: "name-column--cell",
    },
    {
      field: "packetsReceived",
      headerName: "Packets Received",
      type: 'number',
      width: 100,
      cellClassName: "name-column--cell",
    },
  
    {
      field: "packetsLost",
      headerName: "Packets Lost",
      type: 'number',
      width: 100, // Adjust the width as needed
    },
    {
      field: "minimumTime",
      headerName: "Minimum Time",
      type: 'number',
      width: 100, // Adjust the width as needed
    },
    {
      field: "maximumTime",
      headerName: "Maximum Time",
      type: 'number',
      width: 100, // Adjust the width as needed
    },
    {
      field: "averageTime",
      headerName: "Average Time",
      type: 'number',
      width: 100, // Adjust the width as needed
    },
    


    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 2,
    },
    {
      field: "status",
      headerName: "Statut",
      flex: 2,
      renderCell: (params) => (
        <div style={{ color: params.row.success ? "green" : "red" }}>
          {params.row.success ? "Success" : "Failed"}
        </div> ),
    },
   
  ];

  return (
    <Box m="20px">
      <Header subtitle="Historique de ping" />
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
        }}
      >
        <DataGrid
          rows={pingResults}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </Box>
    </Box>
  );
};

export default Ping;