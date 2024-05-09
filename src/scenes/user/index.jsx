import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, Button, Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import axios from 'axios';
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";

const User = () => {
    // Correctly define navigate using the useNavigate hook here
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
  
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get('http://localhost:3001/user/users');
          const usersWithId = response.data.map(user => ({ ...user, id: user._id }));
          setUsers(usersWithId);
        } catch (error) {
          console.error('Erreur lors de la récupération des utilisateurs :', error);
        }
      };
  
      fetchUsers();
    }, []);
  
    
  
    const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
    };



    const deleteuser = async (id) => {
      try {
        await axios.delete(`http://localhost:3001/user/users/${id}`);
        setUsers(users.filter((user) => user.id !== id));
        console.log("useru deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    };
    
    
    const handleDeleteClick = (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this user ?");
      if (confirmDelete) {
        deleteuser(id)
;
      }
    };




    const renderRoleIcon = (access)=> {
      switch (access)


 {
        case "admin":
          return <AdminPanelSettingsOutlinedIcon />;
        case "adminSystem":
          return <SecurityOutlinedIcon />;
        case "technicienReseau":
          return <LockOpenOutlinedIcon />;
        default:
          return null;
      }
    };
  
    const handleEditClick = (userId) => {
        const userToEdit = users.find((user) => user.id === userId);
        navigate(`/modify-user/${userId}`, { state: { user: userToEdit } });
      };
      
  const columns = [

    {
      field: "username",
      headerName: "Nom",
      flex: 0.75,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "number",
      headerName: "Numéro",
      flex: 0.5,
    },
    {
      field: "role",
      headerName: "Rôle",
      flex: 1,
      renderCell: ({ row: { role } }) => (
        <Box
          width="50%"
          m="0 auto"
          p="15px"
          display="flex"
          justifyContent="center"
          backgroundColor={
            role === "admin" ? colors.greenAccent[700] : role === "adminSystem" ? colors.greenAccent[700] : colors.greenAccent[700]
          }
          borderRadius="7px"
        >
          {renderRoleIcon(role)}
          <Typography color={colors.grey[100]} sx={{ ml: "10px" }}>
            {role}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.25,
      renderCell: ({ row }) => (
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={() => handleEditClick(row._id)}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteClick(row._id)}
            sx={{ marginLeft: "10px" }}
          >
            Supprimer
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Liste des utilisateurs "  />
      <Link to="/form">
        <Button 
        sx={{
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
          fontSize: "14px",
          fontWeight: "bold",
          padding: "10px 20px",
        }}  variant="contained">
          Ajouter utilisateur
        </Button>
      </Link>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Utilisateur supprimé avec succès !
        </Alert>
      </Snackbar>
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
        <div style={{ height: 450, width: '100%' }}>
        <DataGrid 
         rows={users}
         columns={columns}
          getRowId={(row) => row._id
        
        } />
        </div>
      </Box>
    </Box>
  );
};

export default User;