/*import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Fonction pour convertir les notes en libellés
const getEvaluationLabel = (note) => {
  switch(Math.round(note)) {
    case 1: return 'Insuffisant';
    case 2: return 'Peu satisfaisant';
    case 3: return 'Satisfaisant';
    case 4: return 'Très satisfaisant';
    case 5: return 'Excellent';
    default: return 'Non évalué';
  }
};

const ChartOne = () => {
  const [sessions, setSessions] = useState<{ id_session: number }[]>([]);
  const [sessionAvis, setSessionAvis] = useState<{ id_session: number; moyenne_note: number; moyenne_adaptation: number; moyenne_pedagogie: number; moyenne_satisfaction: number; nombre_avis: number; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/avis/sessions/with-averages`);
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Données reçues invalides');
        }
        
        setSessionAvis(response.data);
        setSessions(response.data.map(s => ({ id_session: s.id_session })));
        
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
        setSessionAvis([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Préparation des données pour le graphique
  const chartData = {
    labels: sessions.map(session => `Session ${session.id_session}`),
    datasets: [
      {
        label: 'Note globale moyenne',
        data: sessionAvis.map(session => session.moyenne_note || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Adaptation programme',
        data: sessionAvis.map(session =>session.moyenne_adaptation || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Moyens pédagogiques',
        data: sessionAvis.map(session => session.moyenne_pedagogie || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Satisfaction',
        data: sessionAvis.map(session => session.moyenne_satisfaction|| 0),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Comparaison des évaluations moyennes par session',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${value} (${getEvaluationLabel(value)})`;
          },
          afterBody: function(context) {
            const sessionIndex = context[0].dataIndex;
            return `Nombre d'avis: ${sessionAvis[sessionIndex]?.nombre_avis || 0}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          callback: function(value) {
            return getEvaluationLabel(Math.round(value));
          },
          stepSize: 1
        },
        
        title: {
          display: true,
          text: 'Niveau de satisfaction'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Sessions de formation'
        }
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Analyse comparative des sessions</h1>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {loading ? (
        <div className="text-center">Chargement des données...</div>
      ) : (
        <>
          <div className="mb-5" style={{ height: '500px', position: 'relative' }}>
            {sessionAvis.length > 0 ? (
              <Bar 
                data={chartData} 
                options={options}
                redraw
              />
            ) : (
              <div className="text-center">Aucune donnée disponible</div>
            )}
          </div>

          <div className="mb-5">
            <h2>Détails par session</h2>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Note globale</th>
                    <th>Adaptation</th>
                    <th>Pédagogie</th>
                    <th>Satisfaction</th>
                    <th>Nombre d'avis</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionAvis.map((session) => (
                    <tr key={session.id_session}>
                      <td>Session {session.id_session}</td>
                      <td>
                        {session.moyenne_note} 
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_note)})</small>
                      </td>
                      <td>
                        {session.moyenne_adaptation}
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_adaptation)})</small>
                      </td>
                      <td>
                        {session.moyenne_pedagogie}
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_pedagogie)})</small>
                      </td>
                      <td>
                        {session.moyenne_satisfaction}
                        <small className="text-muted"> ({getEvaluationLabel(session.moyenne_satisfaction)})</small>
                      </td>
                      <td>{session.nombre_avis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};*/
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