import React, { useState, useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";
import axios from "axios";
import { parseISO, format, differenceInDays} from "date-fns";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const BarChart = ({ isDashboard = true, equipmentIds, startDate, endDate }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (equipmentIds.length > 0 && startDate && endDate) {
          const response = await axios.post("http://localhost:3001/api/barChartData", {
            startDate,
            endDate,
            equipmentIds,
          });

          if (response.status === 200) {
            const data = response.data;
            const formattedData = formatBarChartData(data);
            setChartData(formattedData);
          } else {
            console.error("Error fetching data. HTTP Status:", response.status);
            setError("Erreur lors de la récupération des données.");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Une erreur s'est produite lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipmentIds, startDate, endDate]);
  
  if (loading) {
    return <div>Loading...</div>;}
  if (error) {
    return <div>Error: {error}</div>;}
    const dateFormat = getDateFormat(startDate, endDate);

  return (
 
    <ResponsiveBar
      data={chartData}
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      indexBy="formattedDate"
      keys={["TTL"]}
      colors={(d) => d.data.color} // Utilisez la couleur définie dans les données
      axisBottom={{
        format: value => format(parseISO(value), dateFormat),
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -90,
        legend: "Temps",
        legendPosition: "middle",
        legendOffset: 40,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "TTL",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: 'hover',
              style: {
                itemOpacity: 1
              }
            }
          ],
          data: [
            { id: 'TTL idéale', value: 'green' },
            { id: 'TTL passable', value: 'orange' },
            { id: 'TTL surpassé', value: 'red' }
          ].map((item) => ({
            id: item.id,
            label: item.id,
            color: item.value
          })),
        }
      ]}


      enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 0.8]] }}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: "#FFF",
              strokeWidth: 1,
            },
          },
          ticks: {
            line: {
              stroke: "#FFF",
              strokeWidth: 1,
            },
            text: {
              fill: "#FFF",
            },
          },
        },
        grid: {
          line: {
            stroke: "#FFF",
            strokeWidth: 1,
          },
        },
        
      }}  
    />

  );
};

const formatBarChartData = (data) => {
  console.log("Formatting data for BarChart");
  return data.map(item => ({
    formattedDate: format(parseISO(item.timestamp), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    TTL: item.TTL,
    color: getColorByTTL(item.TTL)
  })).filter(item => item.formattedDate && item.TTL);
};
const getDateFormat = (startDate, endDate) => {
  const daysDiff = differenceInDays(new Date(endDate), new Date(startDate));
  if (daysDiff <= 1) return "HH:mm";
  else if (daysDiff <= 10) return "MMM dd";
  else if (daysDiff <= 365) return "MM";
  else return "yyyy";
};

const getColorByTTL = (TTL) => {
  console.log("Determining color for TTL:", TTL);
  if (TTL < 56) {
    return "green";
  } else if (TTL >= 56 && TTL <= 113) {
    return "orange";
  } else if (TTL > 113) {
    return "red";
  } else {
    console.error("Unexpected TTL value:", TTL);
  }
};

export default BarChart;
