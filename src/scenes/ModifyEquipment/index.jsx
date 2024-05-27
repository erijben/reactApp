import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Snackbar, Autocomplete } from "@mui/material"; 
import { Formik } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

// Schéma de validation avec Yup
const checkoutSchema = yup.object().shape({
  Nom: yup.string().required("Champ requis"),
  Type: yup.string().required("Champ requis"),
  AdresseIp: yup.string().required("Champ requis"),
  RFID: yup.string().required("Champ requis"),
  Emplacement: yup.string().required("Champ requis"),
  Etat: yup.string().required("Champ requis"),
 
});

// Composant de l'interface de modification
const ModifyEquipment = () => {
  const [equipments, setEquipments] = useState([]);
  const [equipmentData, setEquipmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchEquipmentData = async () => {
      try {
        const response = await axios.get(`https://nodeapp-ectt.onrender.com/equip/equip/${id}`);
        console.log("Données de l'équipement existant :", response.data);
        setEquipmentData(response.data);
      } catch (error) {
        console.error("Error fetching equipment data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchEquipments = async () => {
      try {
        const { data } = await axios.get('https://nodeapp-ectt.onrender.com/equip');
        setEquipments(data);
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
      }
    };

    fetchEquipmentData();
    fetchEquipments();
  }, [id]);

  const handleModifyEquipment = async (values) => {
    try {
      const response = await axios.put(`https://nodeapp-ectt.onrender.com/equip/equip/${id}`, values);
  
      if (response.data.success) {
        setSuccessMessage("Équipement modifié avec succès");
        setErrorMessage(null);
        setTimeout(() => {
          navigate('/team'); 
        }, 800);
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

  const RfidScanner = ({ setFieldValue }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [nfcSupported, setNfcSupported] = useState(false);
  
    useEffect(() => {
      if ("NDEFReader" in window) {
        setNfcSupported(true);
        console.log("NFC supporté");
      } else {
        setNfcSupported(false);
        enqueueSnackbar("NFC n'est pas supporté sur cet appareil ou navigateur.", { variant: 'warning' });
        console.log("NFC non supporté");
      }
    }, [enqueueSnackbar]);
  
    const handleClose = () => {
      setOpen(false);
    };
  
    const readNfcTag = async () => {
      if (nfcSupported) {
        try {
          const reader = new NDEFReader();
          await reader.scan();
          console.log("En attente de la lecture du tag NFC...");
  
          reader.onreading = event => {
            console.log("Tag NFC détecté !");
            const serialNumber = event.serialNumber;
            if (serialNumber) {
              console.log("Numéro de série du tag NFC:", serialNumber);
              setFieldValue('RFID', serialNumber);
              setMessage(`RFID scanné avec succès: ${serialNumber}`);
              setOpen(true);
              enqueueSnackbar(`RFID scanné avec succès: ${serialNumber}`, { variant: 'success' });
              if (navigator.vibrate) {
                navigator.vibrate(200); // Vibration de 200 ms
              }
            } else {
              console.error("Aucune donnée scannée.");
              enqueueSnackbar("Aucune donnée scannée.", { variant: 'warning' });
            }
          };
        } catch (error) {
          console.error(`Erreur de lecture du tag NFC: ${error.message}`);
          setMessage(`Erreur de lecture du tag NFC: ${error.message}`);
          setOpen(true);
          enqueueSnackbar(`Erreur de lecture du tag NFC: ${error.message}`, { variant: 'error' });
        }
      }
    };
  
    return (
      <>
        <Button onClick={readNfcTag} variant="contained" color="primary">
          Scanner RFID
        </Button>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} message={message} />
      </>
    );
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
            initialValues={equipmentData}
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
              setFieldValue,
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
                <RfidScanner setFieldValue={setFieldValue} />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="RFID"
                  value={values.RFID}
                  name="RFID"
                  error={!!errors.RFID}
                  helperText={errors.RFID}
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

export default ModifyEquipment;
