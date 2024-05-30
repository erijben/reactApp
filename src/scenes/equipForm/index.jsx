import React, { useState, useEffect } from 'react'; 
import { Box, Button, TextField, Snackbar, IconButton, InputAdornment, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import NfcIcon from '@mui/icons-material/Nfc'; // Importer l'icône NFC

const RfidScanner = ({ setFieldValue }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [nfcSupported, setNfcSupported] = useState(false);
  const [isReading, setIsReading] = useState(false); // Nouvel état pour éviter les lectures répétées

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
    if (nfcSupported && !isReading) {
      setIsReading(true); // Empêcher les lectures répétées
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
      } finally {
        setIsReading(false); // Réinitialiser l'état de lecture
      }
    }
  };

  return (
    <>
      <IconButton onClick={readNfcTag} color="primary">
        <NfcIcon />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Scanner RFID
        </Typography>
      </IconButton>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} message={message} />
    </>
  );
};

const Contacts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [equipments, setEquipments] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();

  const readNfcTag = async (setFieldValue) => {
    if ("NDEFReader" in window) {
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
        enqueueSnackbar(`Erreur de lecture du tag NFC: ${error.message}`, { variant: 'error' });
      }
    }
  };

  const handleAddEquipment = async (values) => {
    try {
      const newEquipment = {
        Nom: values.Nom,
        Type: values.Type,
        RFID: values.RFID,
        AdresseIp: values.AdresseIp,
        Département: values.Département,
        Etat: values.Etat,
      };

      console.log("Nouvel équipement :", newEquipment);

      const response = await axios.post('https://nodeapp-ectt.onrender.com/equip/add', newEquipment);

      console.log("Réponse du serveur :", response.data);

      if (response.data.success) {
        setSuccessMessage("Équipement ajouté avec succès");
        setErrorMessage(null);
        setTimeout(() => {
          navigate('/team');
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

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const { data } = await axios.get('https://nodeapp-ectt.onrender.com/equip');
        setEquipments(data);
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
      }
    };
    fetchEquipments();
  }, []);
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
          setFieldValue,
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
                value={values.RFID}
                name="RFID"
                error={!!errors.RFID}
                helperText={errors.RFID}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => readNfcTag(setFieldValue)} color="primary">
                        <NfcIcon />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Scanner RFID
                        </Typography>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Département"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.Département}
                name="Département"
                error={!!touched.Département && !!errors.Département}
                helperText={touched.Département && errors.Département}
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
  RFID: yup.string().required("required"),
  Emplacement: yup.string().required("required"),
  Etat: yup.string().required("required"),
 
 
});

const initialValues = {
  Nom: "",
  Type: "",
  AdresseIp: "",
  RFID: "",
  Département: "",
  Etat: "",
};

export default Contacts;
