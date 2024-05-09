import React from 'react';
import { ResponsivePie } from "@nivo/pie";
import { useLocation } from 'react-router-dom';
import { useTheme } from "@mui/material";
import { tokens } from "../theme";


const PieChart = () => {
  const theme = useTheme();
  const location = useLocation();
  const { stats, seuil } = location.state || {}; // Utiliser un objet vide si state n'est pas défini

 // Now, when you're checking if you have the needed data:
 if (!stats || typeof seuil !== 'number') { // Ensure seuil is a number
  return <div>Les données requises ne sont pas disponibles.</div>;
}
 
  // Logique pour définir les données du graphique
  const pieData = [
    {
      id: "green",
      label: "Normal",
      value: stats.green || 0, // Fournir une valeur par défaut
      color: "green",
    },
    {
      id: "orange",
      label: "Pré-alertes",
      value: stats.orange || 0, // Fournir une valeur par défaut
      color: "orange",
    },
    {
      id: "red",
      label: "Alertes",
      value: stats.red || 0, // Fournir une valeur par défaut
      color: "red",
    },
  ];

  
  const colors = tokens(theme.palette.mode);

  return (
    <ResponsivePie
    data={pieData}
    colors={({ id, data }) => {
      switch (id)
 {
        case 'green':
          return 'green';
        case 'orange':
          return 'orange';
        case 'red':
          return 'red';
        default:
          return '#ccc';
      }
    }}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
};

export default PieChart;