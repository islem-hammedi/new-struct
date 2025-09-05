import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

type ChartDataType = {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
    [key: string]: any;
  }[];
  counts: number[];
  total: number;
};

const ChartThree = () => {
  const [chartData, setChartData] = useState<ChartDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/stats/sessions`);
        setChartData(response.data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Statut des Sessions</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        {chartData && (
          <>
            <Doughnut 
              data={{
                labels: chartData.labels,
                datasets: chartData.datasets
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${context.raw}% (${chartData.counts[context.dataIndex]} sessions)`;
                      }
                    }
                  }
                }
              }}
            />
            <div className="mt-4 text-center text-gray-600">
              Total: {chartData.total} sessions
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChartThree;