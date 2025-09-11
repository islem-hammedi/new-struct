import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface FormateurDemande {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  domaine: string;
  themes: string;
  motivation: string;
  cv_path: string;
  created_at: string;
}

const CandidatureFormateur: React.FC = () => {
  const [demandes, setDemandes] = useState<FormateurDemande[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemande, setSelectedDemande] = useState<FormateurDemande | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [candidatures, setCandidatures] = useState<FormateurDemande[]>([]);

  useEffect(() => {
    fetchDemandes();
  }, []);


   const fetchDemandes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiUser/formateur-candidatures`);
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        const candidatureData = Array.isArray(response.data.data) ? response.data.data : [];
        setDemandes(candidatureData);
      } else {
        throw new Error('Format de données inattendu de l\'API');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (axios.isAxiosError(error)) {
        console.error('Erreur API:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        messageApi.error(`Erreur ${error.response?.status || ''} - ${error.message}`);
      } else {
        messageApi.error('Erreur lors du chargement des demandes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);
  

  const getColumns = () => {
    const baseColumns: ColumnsType<FormateurDemande> = [    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone',
    },
    {
      title: 'Domaine',
      dataIndex: 'domaine',
      key: 'domaine',
    },
    {
        title: 'themes',
        dataIndex: 'themes',
        key: 'themes',
      },
    {
      title: 'CV',
      key: 'cv',
      render: (_, record) => (
        <a 
          href={`${import.meta.env.VITE_APP_API_URL}/uploads/${record.cv_path}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Voir CV
        </a>
      ),
    },
   
    ]
      return baseColumns;
    };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white border rounded-lg shadow-md overflow-x-auto">
      {contextHolder}
      <h2 className="text-xl text-teal-500 font-semibold mb-4 text-center">Candidature Formateurs</h2>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-teal-500 font-semibold text-center">
        </h2>
        
      </div>

      <Table 
  columns={getColumns()} 
  dataSource={demandes} 
        rowKey="id"
        loading={loading}
        scroll={{ x: 1300 }}
      />

    
    </div>
  );
};

export default CandidatureFormateur;