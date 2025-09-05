import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartTwo: React.FC = () => {
  const [adminStats, setAdminStats] = useState({
    total_admins: 0,
    admins: 0,
    super_admins: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch admin stats only
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/stats/admins`)
      .then(response => {
        setAdminStats(response.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load admin statistics');
        setLoading(false);
      });
  }, []);

  // Data for admin pie chart
  const adminChartData = [
    { name: 'Admins', value: adminStats.admins },
    { name: 'Super Admins', value: adminStats.super_admins }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Administrateurs</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Administrateurs</p>
              <p className="text-2xl font-bold text-blue-600">{adminStats.total_admins}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Super Administrateurs</p>
              <p className="text-2xl font-bold text-green-600">{adminStats.super_admins}</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adminChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {adminChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
export default ChartTwo;