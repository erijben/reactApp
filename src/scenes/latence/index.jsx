import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveLine } from '@nivo/line';

const LatencyAnalysis = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [equipmentIds, setEquipmentIds] = useState('');
  const [maxAcceptableLatency, setMaxAcceptableLatency] = useState('');
  const [latencyResults, setLatencyResults] = useState([]);
  const [failureCount, setFailureCount] = useState({});

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleLatencyAnalysis = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/latencyAnalysis', {
        startDate,
        endDate,
        equipmentIds: equipmentIds.split(',').map(id => id.trim()),
        maxAcceptableLatency,
      });

      const newLatencyResults = response.data.abnormalLatencyPings;
      processFailureDetection(newLatencyResults);
      setLatencyResults(newLatencyResults);
    } catch (error) {
      console.error('Error fetching latency analysis results:', error);
      // Gérer les erreurs si nécessaire
    }
  
  };


  const processFailureDetection = (newResults) => {
    setFailureCount((prevCount) => {
      const updatedCount = {};
      Object.keys(prevCount).forEach((equipmentId) => {
        updatedCount[equipmentId] = 0;
      });
      return updatedCount;
    });

    newResults.forEach((result) => {
      if (result.latency > maxAcceptableLatency) {
        setFailureCount((prevCount) => ({
          ...prevCount,
          [result.equipmentId]: prevCount[result.equipmentId] + 1,
        }));
      }
    });
  };

  useEffect(() => {
    checkForDysfunction();
  }, [failureCount]);

  const checkForDysfunction = () => {
    Object.entries(failureCount).forEach(([equipmentId, count]) => {
      const isDysfunctional = count >= 3;
      if (isDysfunctional) {
        console.log(`Equipment ${equipmentId} is potentially dysfunctional.`);
        // Actions ou notifications supplémentaires peuvent être ajoutées ici
      }
    });
  };

  const chartData = {
    labels: latencyResults.map(result => result.timestamp),
    datasets: [{
      label: 'Latency (ms)',
      data: latencyResults.map(result => result.latency),
      borderColor: 'rgba(75, 192, 192, 1)',
      fill: false,
    }],
  };

  return (
    <div>
      <h2>Latency Analysis</h2>
      <label>
        Start Date:
        <input type="date" value={startDate} onChange={handleInputChange(setStartDate)} />
      </label>
      <label>
        End Date:
        <input type="date" value={endDate} onChange={handleInputChange(setEndDate)} />
      </label>
      <label>
        Equipment IDs (comma-separated):
        <input type="text" value={equipmentIds} onChange={handleInputChange(setEquipmentIds)} />
      </label>
      <label>
        Max Acceptable Latency:
        <input type="number" value={maxAcceptableLatency} onChange={handleInputChange(setMaxAcceptableLatency)} />
      </label>
      <button onClick={handleLatencyAnalysis}>Perform Latency Analysis</button>

      {latencyResults.length > 0 && (
        <div>
          <h3>Abnormal Latency Results</h3>
          <ul>
            {latencyResults.map((result, index) => (
              <li key={index}>
                <p>Timestamp: {result.timestamp}</p>
                <p>Equipment ID: {result.equipmentId}</p>
                <p>Latency: {result.latency} ms</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {latencyResults.length > 0 && (
        <div>
          <h3>Latency Analysis Results</h3>
          <ResponsiveLine
            data={[
              {
                id: 'Latency',
                data: latencyResults.map(result => ({
                  x: result.timestamp,
                  y: result.latency,
                })),
              },
            ]}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              orient: 'bottom',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Timestamp',
              legendOffset: 36,
              legendPosition: 'middle',
            }}
            axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Latency (ms)',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            colors={{ scheme: 'nivo' }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabel="y"
            pointLabelYOffset={-12}
            enableSlices="x"
          />
        </div>
      )}
    </div>
  );
};

export default LatencyAnalysis;
