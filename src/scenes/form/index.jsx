import { Box, Button, TextField, Snackbar, SnackbarContent, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from "axios";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Form = () => {
  const navigate = useNavigate(); // Ajouter ceci
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [alertMessage, setAlertMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertType, setAlertType] = useState("success"); // Ajout de l'état pour le type d'alerte

  const handleAddUser = async (values) => {
    try {
      const newUser = {
        username: values.username,
        email: values.email,
        number: values.number,
        role: values.role,
      };

      const response = await axios.post('http://localhost:3001/user/users', newUser);
      console.log(response.data);
      setAlertMessage("Utilisateur ajouté avec succès !");
      setAlertType("success"); // Définir le type d'alerte comme succès
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/user'); // Remplacez ceci par le chemin réel de votre liste d'équipements
      }, 800); 
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
      if (error.response && error.response.status === 400) {
        setAlertMessage(error.response.data.error);
      } else {
        setAlertMessage("Erreur lors de l'ajout de l'utilisateur.");
      }
      setAlertType("error"); // Définir le type d'alerte comme erreur
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  const navigateTouserList = () => {
    navigate('/user'); // Remplacez par le chemin correct
  };
  return (
    <Box m="20px">
      <Header title="Ajouter utilisateur " subtitle="voir la liste des utilisateurs " 
      onSubtitleClick={navigateTouserList}/>
      <Snackbar
    open={openSnackbar}
    autoHideDuration={6000}
    onClose={handleCloseSnackbar}
    anchorOrigin={{
      vertical: 'top', // Modifier la position verticale en haut
      horizontal: 'center', // Centrer horizontalement
    }}
  >
    <SnackbarContent
      message={alertMessage}
      sx={{
        backgroundColor: alertType === "success" ? '#4caf50' : '#f44336', // Utilisation du type d'alerte pour définir la couleur
        color: '#fff',
        borderRadius: '8px',
        fontWeight: 'bold',
        padding: '12px',    
      }}
    />
  </Snackbar>

      <Formik
        onSubmit={handleAddUser}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit} method="POST">
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="username"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.number}
                name="number"
                error={!!touched.number && !!errors.number}
                helperText={touched.number && errors.number}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                select
                fullWidth
                variant="filled"
                label="role"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.role}
                name="role"
                error={!!touched.role && !!errors.role}
                helperText={touched.role && errors.role}
                sx={{ gridColumn: "span 4" }}
              >
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="adminSystem">adminSystem</MenuItem>
                <MenuItem value="technicienReseau">technicienReseau</MenuItem>
              </TextField>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Ajouter
              </Button>
            </Box>
          </form>
        )}
      </Formik>

  
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  username: yup.string().required("required"),
  email: yup.string().required("required"),
  number: yup.string().matches(phoneRegExp, "Phone number is not valid").required("required"),
  role: yup.string().required("required"),
});

const initialValues = {
  username: "",
  email: "",
  number: "",
  role: "",
};

export default Form;