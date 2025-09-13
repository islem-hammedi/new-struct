
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface SessionData {
  sessionId: number;
  formateur: string;
  theme: string;
  moyenne: string;
  nombreAvis: number;
  details: {
    min: string;
    max: string;
  };
}

const ChartOne = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<{ success: boolean; data: SessionData[] }>(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/stats/moyennes`
        );

        if (!response.data.success || !Array.isArray(response.data.data)) {
          throw new Error('Format de données incorrect');
        }

        const data = response.data.data;
        
        const chartData = {
          labels: data.map(item => `Session ${item.sessionId} - ${item.theme}`),
          datasets: [
            {
              label: 'Moyenne des notes',
              data: data.map(item => parseFloat(item.moyenne)),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: "Nombre d'avis",
              data: data.map(item => item.nombreAvis),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              type: 'line' as const,
              yAxisID: 'y1'
            }
          ]
        };
        
        setChartData(chartData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des données');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Moyenne des notes par session de formation'
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            if (!chartData) return '';
            const sessionData = chartData.labels[context.dataIndex];
            const sessionId = sessionData.split(' - ')[0].replace('Session ', '');
            const session = chartData.datasets[0].data[context.dataIndex];
            return `Session: ${sessionId}\nFormateur: ${chartData.formateurs?.[context.dataIndex] || 'Inconnu'}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: 'Moyenne des notes (0-5)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Nombre d'avis"
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  if (loading) return <div className="text-center py-4">Chargement en cours...</div>;
  if (error) return <div className="text-red-500 p-4">Erreur: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Évaluations des sessions</h2>
      <div className="relative h-96">
        {chartData ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="text-gray-500">Aucune donnée disponible</div>
        )}
      </div>
    </div>
  );
};

export default ChartOne;