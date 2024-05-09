import axios from 'axios';
import { useEffect, useState } from 'react';
import { ResponsivePie } from '@nivo/pie';

const TTLStatsPieChart = ({ equipmentIds, startDate, endDate }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!equipmentIds || equipmentIds.length === 0 || !startDate || !endDate) {
        console.log('Paramètres manquants pour l\'appel API');
        setData([]);
        return;
      }

      console.log('Envoi de la requête API avec:', { equipmentIds, startDate, endDate });
      try {
        const response = await axios.post('http://localhost:3001/api/ttlStats', {
          equipmentIds,
          startDate,
          endDate
        });
        console.log('Réponse de l\'API:', response.data);

        // Utilisez les couleurs du graphique linéaire et à barres
        const formattedData = [
          { id: 'Normal', value: response.data.green, color: 'green' },  // vert du BarChart
          { id: 'Passable', value: response.data.orange, color: 'orange' },  // orange du LineChart
          { id: 'Surpassed', value: response.data.red, color: 'red' }  // rouge pour des valeurs hautes
        ].filter(item => item.value > 0);

        console.log('Données formatées pour le graphique:', formattedData);
        setData(formattedData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setData([]);
      }
    }

    fetchData();
  }, [equipmentIds, startDate, endDate]);

  return (
    <div style={{ height: "290px", width: "100%" }}>
      {data.length > 0 ? (
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          colors={({ data }) => data.color}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: '#999',
              itemDirection: 'left-to-right',
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: 'circle',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: '#000'
                  }
                }
              ]
            }
          ]}
        />
      ) : <p>Aucune donnée disponible pour les paramètres sélectionnés.</p>}
    </div>
  );
};

export default TTLStatsPieChart;