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
  certificats_path: string | null;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const CandidatureFormateur: React.FC = () => {
  const [demandes, setDemandes] = useState<FormateurDemande[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemande, setSelectedDemande] = useState<FormateurDemande | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const [messageApi, contextHolder] = message.useMessage();
  const [showAccepted, setShowAccepted] = useState(false); // Nouvel état

  useEffect(() => {
    fetchDemandes();
  }, [showAccepted]);


  const handleAction = (demande: FormateurDemande, type: 'accept' | 'reject') => {
    setSelectedDemande(demande);
    setActionType(type);
    setModalVisible(true);
  };

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const endpoint = showAccepted 
      ? '/apiUser/formateur-candidatures/accepted' 
      : '/apiUser/formateur-candidatures';
    
    const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}${endpoint}`);      
      if (response.data && Array.isArray(response.data)) {
        setDemandes(response.data);
      } else {
        throw new Error('Format de données inattendu');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erreur API:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        messageApi.error(`Erreur ${error.response?.status || ''} - ${error.message}`);
      } else {
        console.error('Erreur inattendue:', error);
        messageApi.error('Erreur lors du chargement des demandes');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const confirmAction = async () => {
    if (!selectedDemande) return;
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/formateur-candidatures/${selectedDemande.id}/traiter`, 
        { action: actionType }
      );
  
      if (actionType === 'accept') {
        messageApi.success('Candidature acceptée avec succès');
      } else {
        messageApi.success('Candidature refusée et supprimée');
      }
      
      fetchDemandes();
    } catch (error) {
      let errorMessage = 'Erreur lors du traitement';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      }
      messageApi.error(errorMessage);
    } finally {
      setModalVisible(false);
    }
  };
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
    {
      title: 'Certificats',
      key: 'certificats',
      render: (_, record) => (
        record.certificats_path ? (
          <a 
            href={`${import.meta.env.VITE_APP_API_URL}/uploads/${record.certificats_path}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Voir certificats
          </a>
        ) : 'Aucun'
      ),}
    ]
    if (!showAccepted) {
        baseColumns.push({
          title: 'Actions',
          key: 'actions',
          render: (_, record) => (
            <div className="flex gap-2">
              <Button 
                type="primary" 
                onClick={() => handleAction(record, 'accept')}
                className="bg-green-500 hover:bg-green-600"
              >
                Accepter
              </Button>
              <Button 
                danger 
                onClick={() => handleAction(record, 'reject')}
              >
                Refuser
              </Button>
            </div>
          ),
        });
      }
    
      return baseColumns;
    };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white border rounded-lg shadow-md overflow-x-auto">
      {contextHolder}
      <h2 className="text-xl text-teal-500 font-semibold mb-4 text-center">Candidature Formateurs</h2>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-teal-500 font-semibold text-center">
          {showAccepted ? 'Formateurs Acceptés' : 'Demandes de Formateurs'}
        </h2>w
        <Button 
          type="primary" 
          onClick={() => setShowAccepted(!showAccepted)}
          className={showAccepted ? "bg-teal-500" : "bg-teal-600"}
        >
          {showAccepted ? 'Voir toutes les demandes' : 'Voir formateurs acceptés'}
        </Button>
      </div>

      <Table 
  columns={getColumns()} 
  dataSource={demandes} 
        rowKey="id"
        loading={loading}
        scroll={{ x: 1300 }}
      />

      <Modal
        title={`${actionType === 'accept' ? 'Accepter' : 'Refuser'} la demande`}
        open={modalVisible}
        onOk={confirmAction}
        onCancel={() => setModalVisible(false)}
        okText={actionType === 'accept' ? 'Accepter' : 'Refuser'}
        okButtonProps={{
          danger: actionType === 'reject',
          type: actionType === 'accept' ? 'primary' : 'default'
        }}
      >
        <p>
          Êtes-vous sûr de vouloir {actionType === 'accept' ? 'accepter' : 'refuser'} la demande de{' '}
          <strong>{selectedDemande?.nom}</strong> ({selectedDemande?.email}) ?
        </p>
        {actionType === 'accept' ? (
          <p className="mt-2 text-teal-500">
            Un email de confirmation sera envoyé au formateur.
          </p>
        ) : (
          <p className="mt-2 text-red-600">
            Un email de refus sera envoyé au candidat.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default CandidatureFormateur;