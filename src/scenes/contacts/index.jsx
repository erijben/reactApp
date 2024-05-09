import React, { useState, useEffect } from 'react'; // Ajout de useEffect ici
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Contacts = () => {
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
   
  
  const handleAddEquipment = async (values) => {
    try {
      const connecteAIds = values.ConnecteA.split(',').map(id => id.trim()); // Créer un tableau à partir de la chaîne
      const newEquipment = {
        Nom: values.Nom,
        Type: values.Type,
        RFID: values.RFID,
        AdresseIp: values.AdresseIp,
        Emplacement: values.Emplacement,
        Etat: values.Etat,
        ConnecteA:connecteAIds,
        Pays:values.Pays,
     
      };

      console.log("Nouvel équipement :", newEquipment);

      const response = await axios.post('http://localhost:3001/equip/add', newEquipment);

      console.log("Réponse du serveur :", response.data);

      if (response.data.success) {
        setSuccessMessage("Équipement ajouté avec succès");
        setErrorMessage(null);
        setTimeout(() => {
          navigate('/team'); // Remplacez ceci par le chemin réel de votre liste d'équipements
        }, 800); 
      } else {
        if (response.data.message === "Equipement déjà existant") {
          setErrorMessage("L'adresse IP ou le RFID existe déjà dans la base de données. L'équipement ne peut pas être ajouté.");
        } else {
          setErrorMessage(response.data.message || "Erreur inattendue lors de l'ajout de l'équipement");
        }
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipement :', error);
      setErrorMessage("Erreur lors de l'ajout de l'équipement. Veuillez réessayer plus tard.");
      setSuccessMessage(null);
    }
  };

  return (
    <Box m="20px">
      <Header title="Ajouter un équipement" subtitle="Voir la liste des équipements" />
      {successMessage && (
        <Box bgcolor="success.main" color="success.contrastText" p={2} mb={2} borderRadius={4}>
          {successMessage}
        </Box>
      )}

      {errorMessage && (
        <Box bgcolor="error.main" color="error.contrastText" p={2} mb={2} borderRadius={4}>
          {errorMessage}
        </Box>
      )}
      <Formik
        onSubmit={handleAddEquipment}
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
                label="Nom"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Nom}
                name="Nom"
                error={!!touched.Nom && !!errors.Nom}
                helperText={touched.Nom && errors.Nom}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Type"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Type}
                name="Type"
                error={!!touched.Type && !!errors.Type}
                helperText={touched.Type && errors.Type}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Adresse IP"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.AdresseIp}
                name="AdresseIp"
                error={!!touched.AdresseIp && !!errors.AdresseIp}
                helperText={touched.AdresseIp && errors.AdresseIp}
                sx={{ gridColumn: "span 4" }}
              />
               <TextField
                fullWidth
                variant="filled"
                type="text"
                label="RFID"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.RFID}
                name="RFID"
                error={!!touched.RFID && !!errors.RFID}
                helperText={touched.RFID && errors.RFID}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Emplacement"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Emplacement}
                name="Emplacement"
                error={!!touched.Emplacement && !!errors.Emplacement}
                helperText={touched.Emplacement && errors.Emplacement}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="État"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Etat}
                name="Etat"
                error={!!touched.Etat && !!errors.Etat}
                helperText={touched.Etat && errors.Etat}
                sx={{ gridColumn: "span 4" }}
              />
             
               <TextField
                fullWidth
                variant="filled"
                type="text"
                label="ConnecteA"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.ConnecteA}
                name="ConnecteA"
                error={!!touched.ConnecteA && !!errors.ConnecteA}
                helperText={touched.ConnecteA && errors.ConnecteA}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Pays"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Pays}
                name="Pays"
                error={!!touched.Pays && !!errors.Pays}
                helperText={touched.Pays && errors.Pays}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Ajouter
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  Nom: yup.string().required("required"),
  Type: yup.string().required("required"),
  AdresseIp: yup.string().required("required"),
  RFID: yup.string().required("required"), // Assurez-vous que le champ RFID est requis
  Emplacement: yup.string().required("required"),
  Etat: yup.string().required("required"),
  ConnecteA: yup.string().required("L'ID de l'équipement connecté est requis"),
  Pays: yup.string().required("required") // Ce champ n'est pas obligatoire
});

const initialValues = {
  Nom: "",
  Type: "",
  AdresseIp: "",
  RFID:"",
  Emplacement: "",
  Etat: "",
  ConnecteA:"",
  Pays:"",
};

export default Contacts;