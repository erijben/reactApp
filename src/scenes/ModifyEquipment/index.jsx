// Import des composants nécessaires
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button } from "@mui/material";  // Added Button
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom'; // Assurez-vous d'importer useNavigate


// Schéma de validation avec Yup
const checkoutSchema = yup.object().shape({
  Nom: yup.string().required("Champ requis"),
  Type: yup.string().required("Champ requis"),
  AdresseIp: yup.string().required("Champ requis"),
  Emplacement: yup.string().required("Champ requis"),
  Etat: yup.string().required("Champ requis"),
});

// Composant de l'interface de modification
const ModifyEquipment = () => {
  const [equipmentData, setEquipmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  // Utilisez l'ID de l'équipement à partir de l'URL
  const { id } = useParams();
  const [equipment, setEquipment] = useState({
    Nom: '',
    Type: '',
    AdresseIp: '',
    Emplacement: '',
    Etat: ''
  });

  useEffect(() => {
    const fetchEquipmentData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/equip/equip/${id}`);
        console.log("Données de l'équipement existant :", response.data);
        setEquipmentData(response.data);
      } catch (error) {
        console.error("Error fetching equipment data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEquipmentData();
  }, [id]);
  

  const handleModifyEquipment = async (values) => {
    try {
      const response = await axios.put(`http://localhost:3001/equip/equip/${id}`, values);
  
      if (response.data.success) {
        setSuccessMessage("Équipement modifié avec succès");
        setErrorMessage(null);
        // Ajout d'une temporisation avant de rediriger l'utilisateur
        setTimeout(() => {
          navigate('/team'); // Remplacez ceci par le chemin réel de votre liste d'équipements
        }, 800); // 3000 millisecondes = 3 secondes
      } else {
        setErrorMessage(response.data.message || "Erreur inattendue lors de la modification de l'équipement");
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'équipement :', error);
      setErrorMessage("Erreur lors de la modification de l'équipement. Veuillez réessayer plus tard.");
      setSuccessMessage(null);
    }
  };

  // Gérez les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquipment((prevEquipment) => ({
      ...prevEquipment,
      [name]: value
    }));
  };

  return (
    <Box m="20px">
      <Header title="Modifier un équipement" subtitle="Retour à la liste des équipements" />
      {loading && <p>Loading...</p>}
      
      {!loading && (
        <>
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
    initialValues={equipmentData} // Ces données devraient provenir de l'état initialisé avec les données de l'équipement.
    validationSchema={checkoutSchema}
    onSubmit={handleModifyEquipment}
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
                <Button type="submit" variant="contained" color="primary">
                  Modifier l'équipement
                </Button>
              </form>
            )}
          </Formik>
        </>
      )}
    </Box>
  );
};

// Exportez le composant de l'interface de modification
export default ModifyEquipment;
