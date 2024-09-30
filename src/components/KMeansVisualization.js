import React from 'react';
import { Scatter } from 'react-chartjs-2';

function KMeansVisualization({ data, centroids }) {
  const chartData = {
    datasets: [
      {
        label: 'Data Points',
        data: data.map(point => ({ x: point[0], y: point[1] })),
        backgroundColor: 'rgba(75,192,192,1)',
        pointRadius: 5,
      },
      {
        label: 'Centroids',
        data: centroids.map(centroid => ({ x: centroid[0], y: centroid[1] })),
        backgroundColor: 'rgba(255,99,132,1)',
        pointRadius: 8,
      },
    ],
  };

  return (
    <div>
      <Scatter data={chartData} options={{ scales: { x: {}, y: {} } }} />
    </div>
  );
}

export default KMeansVisualization;
