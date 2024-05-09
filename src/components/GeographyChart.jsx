import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoMercator } from "d3-geo";

const GeographyChart = () => {
  const [data, setData] = useState([]);
  const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
  const projection = geoMercator();

  useEffect(() => {
    axios.get('http://localhost:3001/pays')
      .then(response => {
        if (response.data && Array.isArray(response.data)) {
          setData(response.data.filter(d => d.id != null && d.coordinates && d.coordinates.length === 2));
        }
      })
      .catch(error => {
        console.error("Error retrieving equipment by country", error);
      });
  }, []);

  if (!data.length) {
    return <div>Loading map data...</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ComposableMap projection={projection}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography key={geo.rsmKey} geography={geo} style={{
                default: { fill: "#D6D6DA", outline: "none" },
                hover: { fill: "#F53", outline: "none" },
                pressed: { fill: "#E42", outline: "none" },
              }}/>
            ))
          }
        </Geographies>
        {data.map(({ id, coordinates, icon }) => (
          <Marker key={id} coordinates={coordinates}>
            <image href={icon} height="20" width="20" />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

export default GeographyChart;
