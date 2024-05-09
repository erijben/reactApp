import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, Alert } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";

// Schéma de validation Yup
const configValidationSchema = yup.object().shape({
  Type: yup.string().required('Le type est requis'),
  seuil: yup.string().required('Le seuil est requis'),
  adresseMail: yup.string().email('Veuillez entrer une adresse e-mail valide').required('L’adresse e-mail est requise'),
  // Ajoutez ici d'autres champs si nécessaire
});

const ModifyConfig = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode); // Utilisez tokens si vous avez des tokens de couleur définis
  
  const [configData, setConfigData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/config/configs/${id}`);
        setConfigData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération de la configuration :", error);
        setLoading(false);
      }
    };

    fetchConfig();
  }, [id]);

  const handleModifyConfig = async (values, { setSubmitting }) => {
    try {
      const response = await axios.put(`http://localhost:3001/config/configs/${id}`, values);
      setSuccessMessage("Configuration modifiée avec succès.");
      setTimeout(() => {
        navigate('/config'); // Remplacez ceci par le chemin réel de votre liste d'équipements
      }, 800); // 3000 millisecondes = 3 secondes
    } catch (error) {
      console.error("Erreur lors de la modification de la configuration :", error);
      setErrorMessage("Erreur lors de la modification de la configuration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }


  return (
    <Box m="20px">
      <Header title="Modifier une configuration" subtitle="Retour à la liste des configurations" />
      {loading && <p>Loading...</p>}
      {!loading && (
        <>
          {successMessage && (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Formik
            initialValues={configData || {}}
            validationSchema={configValidationSchema}
            onSubmit={handleModifyConfig}
            enableReinitialize
          >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
          {/* Type de donnée avec Select */}
          <FormControl variant="filled" fullWidth>
            <InputLabel>Type de donnée</InputLabel>
            <Select
              label="Type de donnée"
              name="Type"
              value={values.Type}
              onChange={handleChange}
              error={touched.Type && Boolean(errors.Type)}
            >
              <MenuItem value="size">size</MenuItem>
  <MenuItem value="latency">Latency</MenuItem>
  <MenuItem value="TTL">TTL</MenuItem>
  <MenuItem value="averageTime">averageTime</MenuItem>
  <MenuItem value="packetsReceived">packetsReceived</MenuItem>
  <MenuItem value="minimumTime">minimumTime</MenuItem>
  <MenuItem value="maximumTime">maximumTime</MenuItem>
  
  
            </Select>
          </FormControl>

            <TextField
              fullWidth
              variant="filled"
              label="Seuil"
              name="seuil"
              value={values.seuil}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.seuil && !!errors.seuil}
              helperText={touched.seuil && errors.seuil}
              mt="20px"
            />
            <TextField
              fullWidth
              variant="filled"
              label="Adresse e-mail"
              name="adresseMail"
              value={values.adresseMail}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.adresseMail && !!errors.adresseMail}
              helperText={touched.adresseMail && errors.adresseMail}
              mt="20px"
            />
           <Box mt="20px">
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                Modifier la configuration
              </Button>
              {successMessage && <Box mt={2} color="green">{successMessage}</Box>}
              {errorMessage && <Box mt={2} color="red">{errorMessage}</Box>}
            </Box>
          </form>
        )}
  </Formik>
        </>
      )}
    </Box>
  );
};

export default ModifyConfig;