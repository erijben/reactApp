import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Grid, Paper, Button} from '@mui/material';


const InterventionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [intervention, setIntervention] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchInterventionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/interventions/${id}`);
        setIntervention(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'intervention :", error);
      }
    };
    
    fetchInterventionDetails();
  }, [id]);

  return (
    <Box m="20px">
      {intervention ? (
        <>
          <Paper elevation={3} sx={{ padding: '20px', borderRadius: '12px' }}>
            <Typography variant="h4" mb={3}>
              Détails de l'intervention
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" mb={1}>
                  ID:
                </Typography>
                <Typography variant="body1" fontWeight="bold" mb={2}>
                  {intervention._id}
                </Typography>

                <Typography variant="subtitle1" mb={1}>
                Équipement:
              </Typography>
              <Typography variant="body1" fontWeight="bold" mb={2}>
                {intervention.equipment?.Nom || 'Chargement...'}
              </Typography>

                <Typography variant="subtitle1" mb={1}>
                  Type:
                </Typography>
                <Typography variant="body1" fontWeight="bold" mb={2}>
                  {intervention.type}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" mb={1}>
                  Date:
                </Typography>
                <Typography variant="body1" fontWeight="bold" mb={2}>
                {new Date(intervention.date).toLocaleDateString("fr-FR")}
                </Typography>

                <Typography variant="subtitle1" mb={1}>
                  Description:
                </Typography>
                <Typography variant="body1" fontWeight="bold" mb={2}>
                  {intervention.description}
                </Typography>
                <Typography variant="subtitle1" mb={1}>
                parentIntervention:
                </Typography>
                <Typography variant="body1" fontWeight="bold" mb={2}>
                  {intervention.parentIntervention}
                </Typography>

              </Grid>
            </Grid>
          </Paper>   
        </>
      ) : (
        <Typography>Chargement des détails de l'intervention...</Typography>
      )}
    </Box>
  );
};
export default InterventionDetails;