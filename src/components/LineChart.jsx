import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import axios from 'axios';
import { Box, Typography } from '@mui/material';

const LineChart = ({ selectedEquipments, startDate, endDate, isDashboard = false }) => {
  const [data, setData] = useState([
    {
      id: "TTL",
      data: [],
      color: "transparent",
    },
  ]);

  const getTickValues = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return 'every 1 hour';
    } else {
      return 'every 1 day';
    }
  };

  useEffect(() => {
    console.log("Fetching data for LineChart with", { selectedEquipments, startDate, endDate });
    const fetchData = async () => {
      if (selectedEquipments.length > 0 && startDate && endDate) {
        try {
          const response = await axios.post('https://nodeapp-ectt.onrender.com/api/erij', {
            startDate,
            endDate,
            equipmentIds: selectedEquipments.map(id => id.toString()),
          });

          if (response.status === 200) {
            setData(response.data);
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

  const nivoProperties = {
    margin: { top: 50, right: 110, bottom: 50, left: 60 },
    xScale: {
      type: 'time',
      format: '%Y-%m-%dT%H:%M:%S.%LZ',
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
      tickValues: getTickValues(),
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
    <Box id="linechart" sx={{ height: 250 }}>
      <ResponsiveLine {...nivoProperties} data={data} />
      <Box display="flex" justifyContent="center" mt={2}>
        <Box display="flex" alignItems="center" mr={2}>
          <Box sx={{ width: 10, height: 10, backgroundColor: 'red', borderRadius: '50%', mr: 1 }} />
          <Typography variant="body2">TTL Surpassé</Typography>
        </Box>
        <Box display="flex" alignItems="center" mr={2}>
          <Box sx={{ width: 10, height: 10, backgroundColor: 'orange', borderRadius: '50%', mr: 1 }} />
          <Typography variant="body2">TTL Passable</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box sx={{ width: 10, height: 10, backgroundColor: 'green', borderRadius: '50%', mr: 1 }} />
          <Typography variant="body2">TTL Idéal</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LineChart;
