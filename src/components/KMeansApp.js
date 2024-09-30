import React, { useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register components
Chart.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const KMeansApp = () => {
    const [k, setK] = useState(3); // Number of clusters
    const maxIterations = 100;
    const [initializationMethod, setInitializationMethod] = useState('random'); // Default initialization
    const [data, setData] = useState([]); // Data points for clustering
    const [centroids, setCentroids] = useState([]); // Centroids from the KMeans algorithm
    const [assignments, setAssignments] = useState([]); // Cluster assignments
    const [currentStep, setCurrentStep] = useState(0); // Step in the KMeans process
    const [history, setHistory] = useState([]); // History of centroids and assignments for each step

    const generateRandomData = (numPoints) => {
      const x_values = Array.from({ length: numPoints }, () => Math.random() * 20 - 10);
      const y_values = Array.from({ length: numPoints }, () => Math.random() * 20 - 10);
      return x_values.map((x, idx) => [x, y_values[idx]]);
    }

    const handleInitializationChange = (event) => {
        setInitializationMethod(event.target.value);
    };

    const runKMeans = async () => {
        const data =  generateRandomData(100);
        try {
          const response = await axios.post('/api/kmeans', {
            data: data,  // Pass the newly generated data points
            k: 3,        // Number of clusters
            max_iters: 100, // Optional: maximum iterations
          });
    
          setCentroids(response.data.centroids);
          setAssignments(response.data.assignments);
        } catch (error) {
          console.error('Error running KMeans:', error);
        }
      };

  const stepThroughKMeans = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const showConvergence = () => {
    setCurrentStep(history.length - 1);
  };

  const resetDataSet = () => {
      setData([]); // Reset the data points
      setCentroids([]);
      setAssignments([]);
      setHistory([]);
      setCurrentStep(0);
  };

  const chartData = {
    datasets: [
        {
            label: 'Data Points',
            data: data.map((point, index) => ({
                x: point[0],
                y: point[1],
                r: 5, // Size of the data points
                backgroundColor: assignments[index] !== undefined ? `rgba(${assignments[index] * 50}, 100, 200, 0.6)` : 'rgba(0, 0, 0, 0.6)',
            })),
        },
        {
            label: 'Centroids',
            data: centroids.map((centroid) => ({
                x: centroid[0],
                y: centroid[1],
                r: 10, // Size of the centroids
                backgroundColor: 'red',
            })),
        },
    ],
  };

    return (
        <div>
            <h1>K-Means Clustering</h1>

            <label>
                Number of Clusters (k):
                <input
                    type="number"
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    min="1"
                />
            </label>


            <label>
                Initialization Method:
                <select value={initializationMethod} onChange={handleInitializationChange}>
                    <option value="random">Random</option>
                    <option value="farthest_first">Farthest First</option>
                    <option value="kmeans++">KMeans++</option>
                </select>
            </label>

            <button onClick={runKMeans}>Run KMeans</button>
            <button onClick={stepThroughKMeans}>Step Through KMeans</button>
            <button onClick={showConvergence}>Show Final Convergence</button>
            <button onClick={resetDataSet}>Reset Data Set</button>


            <Scatter data={chartData} options={{
                scales: {
                    x: { beginAtZero: true },
                    y: { beginAtZero: true },
                },
                plugins: {
                    legend: { display: true },
                },
            }} />

        </div>
    );
};

export default KMeansApp;


