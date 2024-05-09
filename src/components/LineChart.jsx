import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import axios from 'axios';

const LineChart = ({ selectedEquipments, startDate, endDate, isDashboard = false }) => {
  const [data, setData] = useState([
    {
      id: "TTL",
      data: [], // Pas de points de données initiaux
      color: "transparent", // Couleur transparente pour que rien ne s'affiche
    },
  ]);
  const getTickValues = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 1) {
      // Si la plage est inférieure à 1 jour, montrez chaque heure
      return 'every 1 hour';
    } else {
      // Sinon, montrez chaque jour
      return 'every 1 day';
    }
  };
  
  useEffect(() => {
    console.log("Fetching data for LineChart with", { selectedEquipments, startDate, endDate });
    const fetchData = async () => {
      if (selectedEquipments.length > 0 && startDate && endDate) {
        try {
          const response = await axios.post('http://localhost:3001/api/erij', {
            startDate,
            endDate,
            equipmentIds: selectedEquipments.map(id => id.toString()),
          });

          if (response.status === 200) {
            setData(response.data); // Assuming the backend data is formatted correctly for Nivo
          } else {
            console.error('Error fetching data:', response.status);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [selectedEquipments, startDate, endDate]);

  // Nivo Line chart settings and properties
  const nivoProperties = {
    margin: { top: 50, right: 110, bottom: 50, left: 60 },
    xScale: {
      type: 'time',
      format: '%Y-%m-%dT%H:%M:%S.%LZ', // This format should match your date format
      precision: 'second',
    },
    xFormat: 'time:%Y-%m-%d',
    yScale: {
      type: 'linear',
      min: 'auto',
      max: 'auto',
      stacked: false,
    },
    axisLeft: {
      legend: 'TTL',
      legendPosition: 'middle',
      legendOffset: -40,
    },
    axisBottom: {
      format: '%b %d',
      tickValues: getTickValues(), // Appel de la fonction pour déterminer les valeurs des ticks
      legend: 'Temps',
      legendPosition: 'middle',
      legendOffset: 32,
    },
    colors: d => d.color,
    animate: true,
    enableSlices: 'x',
    theme: {
      background: "transparent",
      axis: {
        ticks: {
          text: { fill: "#eee" }
        },
        legend: {
          text: { fill: "#aaa", fontSize: 12 }
        },
      },
      grid: {
        line: { stroke: "#444444" }
      },
      legends: {
        text: { fill: "#aaa" }
      },
      tooltip: {
        container: {
          background: "rgba(0, 0, 0, 0.7)",
          color: "white"
        },
      },
    },
  };

  return (
    <div id="linechart" style={{ height: 250 }}>
      <ResponsiveLine {...nivoProperties} data={data} />
    </div>
  );
};

export default LineChart;

