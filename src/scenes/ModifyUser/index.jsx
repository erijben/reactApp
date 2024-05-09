import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, Alert } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';

const ModifyUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:3001/user/users/${id}`)
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setErrorMessage("Erreur lors du chargement des données de l'utilisateur.");
      });
  }, [id]);

  const userSchema = yup.object().shape({
    username: yup.string().required("Le nom d'utilisateur est requis."),
    email: yup.string().email("L'email n'est pas valide").required("L'email est requis."),
    number: yup.string().required("Le numéro est requis."),
    role: yup.string().required("Le rôle est requis."),
  });

  const handleSubmit = (values, actions) => {
    axios.put(`http://localhost:3001/user/users/${id}`, values)
      .then(response => {
        setSuccessMessage("Utilisateur modifié avec succès.");
        // Ici nous ajoutons un délai similaire à ModifyEquipment avant la redirection
        setTimeout(() => {
          navigate('/user'); // Mettez à jour ceci avec votre chemin de redirection
        }, 1000); // 3 secondes avant redirection
      })
      .catch(error => {
        console.error('Error updating user:', error);
        setErrorMessage("Erreur lors de la mise à jour de l'utilisateur.");
        actions.setSubmitting(false);
      });
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <Box m="20px">
      <Header title="Modifier utilisateur" subtitle="Retour à la liste des utilisateurs" />
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
            initialValues={user || {}}
            validationSchema={userSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {formik => (
              <Form>
                <Field as={TextField} label="Nom d'utilisateur" name="username" fullWidth />
                <Field as={TextField} label="Email" name="email" type="email" fullWidth />
                <Field as={TextField} label="Numéro" name="number" fullWidth />
                <Field as={TextField} select label="Rôle" name="role" fullWidth>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="adminSystem">Admin System</MenuItem>
                  <MenuItem value="technicienReseau">Technicien Réseau</MenuItem>
                </Field>
                <Button type="submit" variant="contained" color="primary">
                  Modifier
                </Button>
              </Form>
            )}
          </Formik>
        </>
      )}
    </Box>
  );
};

export default ModifyUser;