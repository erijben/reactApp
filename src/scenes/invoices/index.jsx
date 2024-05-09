import { Box, Button, TextField } from "@mui/material";
import { useParams } from 'react-router-dom';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import React, { useState } from "react";
import { MenuItem, Select } from "@mui/material";
const Invoices = () => {
  const navigate = useNavigate(); // Ajouter ceci
  const { equipmentId } = useParams();
console.log("Equipment ID from URL params:", equipmentId);
const [successMessage, setSuccessMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");
const initialValues = {
  Type: "",
  seuil: "",
  adresseMail: "",
  equipment: equipmentId || "",  // Utilisez `equipmentId` ici
};
console.log("Initial values for form:", initialValues);

  const handleAddConfig = async (values, { setSubmitting }) => {
    console.log("Submitting form with values:", values); // Suivi des valeurs soumises
  
    try {
      const newconfig = {
        Type: values.Type,
        seuil: values.seuil,
        adresseMail: values.adresseMail,
        equipment: values.equipment,
      };

      console.log("Nouvelle configuration :", newconfig);
      const response = await axios.post('http://localhost:3001/config/configs', newconfig);
      console.log("Réponse du serveur :", response.data);
      setSuccessMessage("Configuration ajoutée avec succès !");
      setTimeout(() => {
        navigate('/config'); // Remplacez ceci par le chemin réel de votre liste d'équipements
      }, 800); 
      setErrorMessage(""); // Réinitialiser le message d'erreur s'il y en avait un
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la configuration :', error);
      setErrorMessage("Erreur lors de l'ajout de la configuration.");
      setSuccessMessage(""); }};
  
 
      const navigateToConfigList = () => {
        navigate('/config'); // Remplacez par le chemin correct
      };
      return (
        <Box m="20px">
          <Header title="Configurer un équipement" subtitle="Voir la liste des configurations" 
          onSubtitleClick={navigateToConfigList}
          />
      
      <Formik
      
      onSubmit={handleAddConfig}
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
        }) => {
          console.log("Form values:", values);
          return(
            <form onSubmit={handleSubmit}>
              <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
                 <TextField
                select
                fullWidth
                 variant="filled"
                 label="Sélectionner le type de donnée"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.Type}
                  name="Type"
                 error={!!touched.Type && !!errors.Type}
                  helperText={touched.Type && errors.Type}
                  sx={{ gridColumn: "span 4" }}
>
  
  <MenuItem value="size">size</MenuItem>
  <MenuItem value="latency">Latency</MenuItem>
  <MenuItem value="TTL">TTL</MenuItem>
  <MenuItem value="averageTime">averageTime</MenuItem>
  <MenuItem value="packetsReceived">packetsReceived</MenuItem>
  <MenuItem value="minimumTime">minimumTime</MenuItem>
  <MenuItem value="maximumTime">maximumTime</MenuItem>
</TextField>
<TextField
                fullWidth
                variant="filled"
                type="text"
                label="Entrer le seuil  "
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.seuil}
                name="seuil"
                error={!!touched.seuil && !!errors.seuil}
                helperText={touched.seuil && errors.seuil}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Entrer l' adresse email du technicien "
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.adresseMail}
                name="adresseMail"
                error={!!touched.adresseMail && !!errors.adresseMail}
                helperText={touched.adresseMail && errors.adresseMail}
                sx={{ gridColumn: "span 4" }}
              />          
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Ajouter
              </Button>
            </Box>
            {successMessage && (
              <Box mt={2} color="green">
                {successMessage}
              </Box>
            )}
            {errorMessage && (
              <Box mt={2} color="red">
                {errorMessage}
                </Box>
            )}
          </form>
      );
    }}
  </Formik>
</Box>
);
};
  const checkoutSchema = yup.object().shape({
    Type: yup.string().required("required"),
    seuil: yup.string().required("required"),
  
    adresseMail: yup
    .string()
    .email("Veuillez entrer une adresse e-mail valide")
    .required("required"),
   equipment: yup.string().required("required"),
 });
export default Invoices;
