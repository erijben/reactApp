import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, MenuItem, TextField, FormControl, InputLabel,  useTheme  } from '@mui/material';
import { Formik } from 'formik';
import { Autocomplete } from '@mui/material';
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Intervention = () => {
  const theme = useTheme();
  const [equipments, setEquipments] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [search, setSearch] = useState('');
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/equip');
        setEquipments(data);
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
      }
    };
    fetchEquipments();
  }, []);

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/api/interventions/search?search=${search}`);
        setInterventions(data);
      } catch (error) {
        console.error('Erreur lors du chargement des interventions:', error);
      }
    };
    if (search.length > 2) {
      fetchInterventions();
    }
  }, [search]);

  const initialValues = {
    equipment: "",
    type: "",
    date: "",
    description: "",
    parentIntervention: "",
    statut: ""
  };

  const validationSchema = yup.object().shape({
    equipment: yup.string().required("Le champ équipement est requis"),
    type: yup.string().required("Le champ type est requis"),
    date: yup.date().required("Le champ date est requis"),
    description: yup.string().required("Le champ description est requis"),
    parentIntervention: yup.string().nullable(),
    statut: yup.string().oneOf(['En cours', 'Réussie', 'Échec'], 'Statut invalide').required("Le statut est requis"),
  });

  const handleAddIntervention = async (values) => {
    try {
      const response = await axios.post('http://localhost:3001/api/interventions', values);
      if (response.data.success) {
        setSuccessMessage("Intervention ajoutée avec succès");
      } else {
        
        setSuccessMessage(response.data.message || "Ajout réussi");
        setTimeout(() => navigate('/liste'), 800);
      }
      setErrorMessage(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'intervention :', error);
      setErrorMessage("Erreur côté client : " + error.message);
      setSuccessMessage(null);
    }
  };

  const navigateToinvList = () => {
    navigate('/liste');
  };

  return (
    <Box m="20px">
      <Header title="Ajouter une intervention" subtitle="Voir la liste des interventions" onSubtitleClick={navigateToinvList} />
      {successMessage && <Box bgcolor="success.main" color="success.contrastText" p={2} mb={2} borderRadius={4}>{successMessage}</Box>}
      {errorMessage && <Box bgcolor="error.main" color="error.contrastText" p={2} mb={2} borderRadius={4}>{errorMessage}</Box>}
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleAddIntervention}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
            <Autocomplete
                freeSolo
                disableClearable
                options={equipments}
                getOptionLabel={(option) => option.Nom || ''}
                onChange={(event, newValue) => {
                  handleChange('equipment')(newValue ? newValue._id : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sélectionner équipement"
                    variant="outlined"
                    fullWidth
                    onChange={(event) => setSearch(event.target.value)}
                    onBlur={handleBlur}
                  />
                )}
              />
              <TextField fullWidth variant="filled" type="text" label="Type" name="type" value={values.type} onChange={handleChange} onBlur={handleBlur} error={touched.type && Boolean(errors.type)} helperText={touched.type && errors.type} sx={{ gridColumn: "span 4" }} />
              <TextField fullWidth variant="filled" type="date" label="Date" name="date" value={values.date} onChange={handleChange} onBlur={handleBlur} error={touched.date && Boolean(errors.date)} helperText={touched.date && errors.date} sx={{ gridColumn: "span 4" }} />
              <Autocomplete
  freeSolo
  disableClearable
  options={interventions}
  getOptionLabel={(option) => option.description || ''}
  onChange={(event, newValue) => {
    handleChange('parentIntervention')(newValue ? newValue._id : '');
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Rechercher l'intervention précedente par description"
      variant="outlined"
      fullWidth
      onChange={(event) => setSearch(event.target.value)}
      onBlur={handleBlur}
      error={touched.parentIntervention && Boolean(errors.parentIntervention)}
      helperText={touched.parentIntervention && errors.parentIntervention}
    />
  )}
/>

              <TextField select fullWidth variant="filled" label="Statut" name="statut" value={values.statut} onChange={handleChange} onBlur={handleBlur} error={touched.statut && Boolean(errors.statut)} helperText={touched.statut && errors.statut} sx={{ gridColumn: "span 4" }}>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="Réussie">Réussie</MenuItem>
                <MenuItem value="Échec">Échec</MenuItem>
              </TextField>
              <TextField fullWidth variant="filled" type="text" label="Description" name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} error={touched.description && Boolean(errors.description)} helperText={touched.description && errors.description} sx={{ gridColumn: "span 4" }} />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">Ajouter</Button>
            </Box>
          </form>
        )}
      </Formik>
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
    </Box>
  );
};

export default Intervention;