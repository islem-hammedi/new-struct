import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } from "docx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiPrinter, FiDownload, FiCalendar, FiClock, FiUser, FiBriefcase, FiHome, FiMail, FiPhone, FiCheckSquare } from 'react-icons/fi';

interface Theme {
  id_session: number;
  theme: string;
  formateur: string;
  date_debut: string;
  date_fin: string;
  lieu: string;
  duree: number;
  mode?: string;
  credit_import?: boolean | null;
  emargement?: string | null;
  droit_triage?: string | null;
  nb_participant?: number;
  etat?: string;
}
interface Formation{
  id_formation: number;
  domaine: string;
  sessions:Theme[];
}
interface Participant {
  id: number;
  nomPrenom: string;
  CIN: string;
  emargements: Record<string, string>;
  mail?: string;
  telephone?: string;
  directionService?: string;
  entreprise?: string;

}

interface Formateur {
  nomPrenom: string;
  cin: string;
}

interface FormData {
  creditImpôt: boolean;
  droitTirage: string;
  modeFormation: string;
  coOrganisateurs: string;
  lieuDeroulement: string;
  duree: number;
  horaireDe: string;
  horaireA: string;
  pauseDe: string;
  pauseA: string;
  formateur: Formateur;
  entrepriseBeneficiaire: string;
  themeFormation?: number;
  periodeDu?: string;
  periodeAu?: string;
}

const FeuillePresence = () => {
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
const [formations, setFormations] = useState<Formation[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [formData, setFormData] = useState<FormData>({
    creditImpôt: false,
    droitTirage: '',
    modeFormation: '',
    coOrganisateurs: '',
    lieuDeroulement: '',
    duree: 0,
    horaireDe: '08:30',
    horaireA: '17:00',
    pauseDe: '12:00',
    pauseA: '13:30',
    formateur: {
      nomPrenom: '',
      cin: '',
    },
    entrepriseBeneficiaire: '',
  });
  const [showParticipantColumns, setShowParticipantColumns] = useState({
    CIN: true,
    mail: true,
    directionService: true,
    entreprise: true

  });

  const generatePDF = async () => {
    try {
      const element = document.getElementById("feuille-presence");
      
      if (!element) {
        throw new Error("Élément introuvable pour la génération du PDF");
      }
  
      const canvas = await html2canvas(element, {
        scale: 2, 
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
  
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });
  
      const imgWidth = 210; 
      const pageHeight = 295; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const fileName = `Feuille_Presence_${selectedTheme?.theme.replace(/\s+/g, '_') || 'formation'}.pdf`;
      pdf.save(fileName);
  
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF");
    }
  };

  const generateWordDocument = () => {
    if (!selectedTheme) return;
  
    const title = new Paragraph({
      text: "FEUILLE DE PRÉSENCE",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });
  
    const themeInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Thème de formation: ${selectedTheme.theme}`,
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    });
  
    const dateInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Période: Du ${formatDateForDisplay(selectedTheme.date_debut)} au ${formatDateForDisplay(selectedTheme.date_fin)}`,
        }),
      ],
      spacing: { after: 100 },
    });
  
    const formateurInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Formateur: ${formData.formateur.nomPrenom}`,
        }),
      ],
      spacing: { after: 100 },
    });
  
    const lieuInfo = new Paragraph({
      children: [
        new TextRun({
          text: `Lieu: ${formData.lieuDeroulement}`,
        }),
      ],
      spacing: { after: 200 },
    });
  
    const participantRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("N°")], width: { size: 500, type: WidthType.DXA } }),
          new TableCell({ children: [new Paragraph("Nom et Prénom")], width: { size: 3000, type: WidthType.DXA } }),
          ...(showParticipantColumns.CIN ? [new TableCell({ children: [new Paragraph("CIN")], width: { size: 1500, type: WidthType.DXA } })] : []),
          ...(showParticipantColumns.directionService ? [new TableCell({ children: [new Paragraph("Direction/Service")], width: { size: 2000, type: WidthType.DXA } })] : []),
          ...(showParticipantColumns.entreprise ? [new TableCell({ children: [new Paragraph("Entreprise")], width: { size: 2000, type: WidthType.DXA } })] : []),
          ...generateEmargementHeaders(),
        ],
      }),
      ...participants.map((participant, index) => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph((index + 1).toString())] }),
            new TableCell({ children: [new Paragraph(participant.nomPrenom)] }),
            ...(showParticipantColumns.CIN ? [new TableCell({ children: [new Paragraph(participant.CIN)] })] : []),
            ...(showParticipantColumns.directionService ? [new TableCell({ children: [new Paragraph(participant.directionService)] })] : []),
            ...(showParticipantColumns.entreprise ? [new TableCell({ children: [new Paragraph(participant.entreprise)] })] : []),
            ...generateEmargementCells(participant),
          ],
        })
      ),
    ];
  
    const participantsTable = new Table({
      rows: participantRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          title,
          themeInfo,
          dateInfo,
          formateurInfo,
          lieuInfo,
          new Paragraph({
            children: [
              new TextRun({
                text: "Liste des participants:",
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          participantsTable,
        ],
      }],
    });
  
    return doc;
  };
  
  const formatDateForDisplay = (dateString: string) => {
    const date = parseCustomDate(dateString);
    if (!date) return '';
    return date.toLocaleDateString('fr-FR');
  };
  
  const generateEmargementHeaders = () => {
    if (!selectedTheme) return [];
    
    const headers = [];
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
    
    if (!startDate || !endDate) return [];
    
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      headers.push(
        new TableCell({
          children: [new Paragraph(formatDateForDisplay(currentDate.toISOString()))],
          width: { size: 1500, type: WidthType.DXA },
        })
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return headers;
  };
  
  const generateEmargementCells = (participant: Participant) => {
    if (!selectedTheme) return [];
    
    const cells = [];
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
    
    if (!startDate || !endDate) return [];
    
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      cells.push(
        new TableCell({
          children: [new Paragraph(participant.emargements[dateKey] || '')],
        })
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return cells;
  };

  const fetchSessionDetails = async (idSession: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/session/${idSession}`);
      const { session, participants } = response.data.data;
      
      setSelectedTheme({
        id_session: session.id_session,
        theme: session.theme,
        formateur: session.formateur,
        date_debut: session.date_debut,
        date_fin: session.date_fin,
        duree: session.duree,
        lieu: session.lieu
      });

      const mappedParticipants = participants.map((p: any) => ({
        id: p.id,
        nomPrenom: p.nom_complet,
        CIN: p.CIN,
        mail: p.mail || '',
        telephone: p.telephone || '',
        emargements: p.emargement ? JSON.parse(p.emargement) : generateEmargementDays(session.date_debut, session.date_fin),
      }));

      setParticipants(mappedParticipants);

      setFormData(prev => ({
        ...prev,
        themeFormation: session.id_session,
        lieuDeroulement: session.lieu,
        periodeDu: formatDateForInput(session.date_debut), 
        periodeAu: formatDateForInput(session.date_fin),formateur: {
          nomPrenom: session.formateur_nom,
          cin: '' 
        },
        horaireDe: session.horaire_debut || '',
        horaireA: session.horaire_fin || '',
        modeFormation: session.mode || '',
        droitTirage: session.droit_tirage || '',
        creditImpôt: session.credit_import === '1'
      }));

    } catch (error) {
      console.error("Erreur lors du chargement de la session:", error);
    }
  };
  const formatDateForInput = (dateString: string): string => {
    const date = parseCustomDate(dateString);
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const response = await axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`);
        console.log('Réponse API:', response.data); 
         
        const allFormations: Formation[] = response.data.data || response.data;
        setFormations(allFormations);
        
        const allThemes: Theme[] = allFormations.flatMap((formation: Formation) => 
          formation.sessions || []
        );
        
        console.log('Tous les thèmes:', allThemes);
        const realisedThemes = allThemes.filter((theme: Theme) => 
          theme.etat && theme.etat.includes('déjà réalisée')
        );
        
        console.log('Thèmes réalisés:', realisedThemes);
        setFilteredThemes(realisedThemes);
      } catch (error) {
        console.error("Erreur lors du chargement des thèmes:", error);
      }
    };
    
    loadThemes();
  }, []);
  const parseCustomDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    
    console.error("Format de date non reconnu:", dateString);
    return null;
  };
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = parseInt(e.target.value);
    const theme = filteredThemes.find(t => t.id_session === themeId) || null;
    setSelectedTheme(theme);
    
    setFormData(prev => ({
      ...prev,
      themeFormation: themeId,
      lieuDeroulement: theme?.lieu || '',
      periodeDu: theme?.date_debut ? theme.date_debut.split('T')[0] : '',
      periodeAu: theme?.date_fin ? theme.date_fin.split('T')[0] : '',
      formateur: {
        ...prev.formateur,
        nomPrenom: theme?.formateur|| ''
      }
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormateurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      formateur: {
        ...prevData.formateur,
        [name]: value
      }
    }));
  };
  const removeParticipant = (id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked,
    }));
  };

const addParticipant = () => {
    if (!selectedTheme) return;
    
    setParticipants(prev => [
      ...prev,
      {
        id: Date.now(),
        nomPrenom: '',
        CIN: '',
        emargements: generateEmargementDays(selectedTheme.date_debut, selectedTheme.date_fin)
      }
    ]);
  };
  const generateEmargementDays = (startDateStr: string, endDateStr: string): Record<string, string> => {
    const emargements: Record<string, string> = {};
    const startDate = parseCustomDate(startDateStr);
    const endDate = parseCustomDate(endDateStr);
  
    if (!startDate || !endDate) {
      console.error("Dates invalides pour générer les émargements");
      return {};
    }
  
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      emargements[dateKey] = '';
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return emargements;
  };
  const handleFormSubmit = async () => {
    try {
        if (!selectedTheme?.id_session) {
            throw new Error("Veuillez sélectionner une session");
        }

        if (!participants.length) {
            throw new Error("Veuillez ajouter au moins un participant");
        }

        const payload = {
          id_session: selectedTheme.id_session, 
            participants: participants.map(p => ({
                CIN: p.CIN,
                nomComplet: p.nomPrenom,
                mail: p.mail || null,
                telephone: p.telephone || null,
                emargements: p.emargements || {},
            })),
            creditImpôt: formData.creditImpôt,
            droitTirage: formData.droitTirage,
            modeFormation: formData.modeFormation,
            coOrganisateurs: formData.coOrganisateurs,
            entreprise_beneficiaire: formData.entrepriseBeneficiaire
        };

        console.log('Envoi du payload:', payload);

        const response = await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/apiAdmin/participations`, 
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                timeout: 10000
            }
        );

        console.log('Réponse API:', response.data);

        if (!response.data.success) {
            throw new Error(response.data.error || "Erreur serveur");
        }

        const apiResults = response.data.data?.results || [];
        if (apiResults.length > 0) {
            const updatedParticipants = participants.map(p => {
                const match = apiResults.find((r: any) => r.CIN === p.CIN);
                return match?.id_participant 
                    ? { ...p, id: match.id_participant }
                    : p;
            });
            setParticipants(updatedParticipants);
        }

        alert(response.data.data?.message || "Enregistrement réussi");

        const doc = generateWordDocument();
        if (!doc) {
          throw new Error("Erreur lors de la génération du document Word");
        }
    
    const { Packer } = await import('docx');
    const blob = await Packer.toBlob(doc);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Feuille_Presence_${selectedTheme.theme.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    } catch (error) {
      let errorMessage = "Une erreur est survenue";
      let errorResponseData;

      if (typeof error === "object" && error !== null) {
        if ("message" in error && typeof (error as any).message === "string") {
          errorMessage = (error as any).message;
        }
        if ("response" in error && (error as any).response?.data) {
          errorResponseData = (error as any).response.data;
        }
      }
     

      if (errorResponseData?.error) {
          errorMessage = errorResponseData.error;
      } else if (errorResponseData?.message) {
          errorMessage = errorResponseData.message;
      }

      alert(`Erreur: ${errorMessage}`);
  }
};
  const renderEmargementColumns = () => {
    if (!selectedTheme) return null;
    
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
  
    if (!startDate || !endDate) {
      console.error("Dates invalides:", selectedTheme.date_debut, selectedTheme.date_fin);
      return null;
    }
  
    const columns = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const formattedDate = currentDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  
      columns.push(
        <th key={dateKey} className="border p-2">
          <div className="flex justify-between items-center">
            <span>Journée du {formattedDate}</span>
            <button 
              onClick={() => handleRemoveEmargementColumn(dateKey)}
              className="text-red-500 text-xs"
            >
              ×
            </button>
          </div>
        </th>
      );
  
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return columns;
  };
  const handleRemoveEmargementColumn = (dateKey: string) => {
    setParticipants(prev => 
      prev.map(p => {
        const newEmargements = {...p.emargements};
        delete newEmargements[dateKey];
        return {...p, emargements: newEmargements};
      })
    );
  };


  const renderEmargementCells = (participant: Participant) => {
    if (!selectedTheme) return null;
    
    const startDate = parseCustomDate(selectedTheme.date_debut);
    const endDate = parseCustomDate(selectedTheme.date_fin);
  
    if (!startDate || !endDate) return null;
  
    const cells = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      cells.push(
        <td key={dateKey} className="border p-2">
          <input 
            type="text"
            value={participant.emargements[dateKey] || ''} 
            onChange={(e) => {
              const updatedParticipants = [...participants];
              const participantIndex = updatedParticipants.findIndex(p => p.id === participant.id);
              updatedParticipants[participantIndex].emargements[dateKey] = e.target.value;
              setParticipants(updatedParticipants);
            }} 
            className="w-full p-1 border rounded"
            placeholder=""
          />
        </td>
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return cells;
  };
  const toggleParticipantColumn = (column: keyof typeof showParticipantColumns) => {
    setShowParticipantColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

   return (
    <div id="feuille-presence" className="container mx-auto p-4 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Feuille de Présence</h1>
          <p className="text-gray-600 text-center">Gestion des présences pour les sessions de formation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiCheckSquare className="mr-2 text-teal-500" />
              Options
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="creditImpôt" 
                  name="creditImpôt"
                  checked={formData.creditImpôt} 
                  onChange={handleCheckboxChange} 
                  className="h-5 w-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                />
                <label htmlFor="creditImpôt" className="ml-2 block text-gray-700">Crédit d'impôt</label>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Droits de tirage</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="droitIndividuel" 
                      name="droitTirage" 
                      value="individuel" 
                      checked={formData.droitTirage === 'individuel'} 
                      onChange={handleChange} 
                      className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="droitIndividuel" className="ml-2 text-gray-700">Individuel</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="droitCollectif" 
                      name="droitTirage" 
                      value="collectif" 
                      checked={formData.droitTirage === 'collectif'} 
                      onChange={handleChange} 
                      className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="droitCollectif" className="ml-2 text-gray-700">Collectif</label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mode de formation</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="intraEntreprise" 
                      name="modeFormation" 
                      value="intra-entreprise" 
                      checked={formData.modeFormation === 'intra-entreprise'} 
                      onChange={handleChange} 
                      className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="intraEntreprise" className="ml-2 text-gray-700">Intra-entreprise</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="interEntreprise" 
                      name="modeFormation" 
                      value="inter-entreprise" 
                      checked={formData.modeFormation === 'inter-entreprise'} 
                      onChange={handleChange} 
                      className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="interEntreprise" className="ml-2 text-gray-700">Inter-entreprise</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiCalendar className="mr-2 text-teal-500" />
              Session
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Thème de formation</label>
                <select 
                  name="themeFormation"
                  value={formData.themeFormation || ''} 
                  onChange={handleThemeChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un thème</option>
                  {filteredThemes.map(theme => (
                    <option key={theme.id_session} value={theme.id_session}>
                      {theme.theme ||'??'} |Formateur: {theme.formateur || '??'}|début: {formatDateForInput(theme.date_debut )|| '??'}|Fin: {formatDateForInput(theme.date_fin) || '??'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Lieu de déroulement</label>
                <input 
                  type="text" 
                  name="lieuDeroulement"
                  value={formData.lieuDeroulement} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Date début</label>
                  <input 
                    type="date" 
                    name="periodeDu"
                    value={formatDateForInput(formData.periodeDu || '')} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Date fin</label>
                  <input 
                    type="date" 
                    name="periodeAu"
                    value={formatDateForInput(formData.periodeAu || '')} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiClock className="mr-2 text-teal-500" />
              Horaires
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Durée (heures)</label>
                <input 
                  type="number" 
                  name="duree"
                  value={formData.duree} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Horaires de formation</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="time" 
                    name="horaireDe"
                    value={formData.horaireDe} 
                    onChange={handleChange} 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <input 
                    type="time" 
                    name="horaireA"
                    value={formData.horaireA} 
                    onChange={handleChange} 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Pause</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="time" 
                    name="pauseDe"
                    value={formData.pauseDe} 
                    onChange={handleChange} 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <input 
                    type="time" 
                    name="pauseA"
                    value={formData.pauseA} 
                    onChange={handleChange} 
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4 md:mb-0">
              <FiUser className="mr-2 text-teal-500" />
              Liste des Participants
            </h2>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => toggleParticipantColumn('CIN')} 
                className="{px-4 py-2 rounded-lg text-sm font-medium flex items-center ${showParticipantColumns.CIN ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700'}}"
              >
                {showParticipantColumns.CIN ? 'Masquer CIN' : 'Afficher CIN'}
              </button>
              
              <button 
                onClick={addParticipant} 
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium flex items-center"
              >
                <FiPlus className="mr-1" />
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom et Prénom</th>
                  {showParticipantColumns.CIN && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° CIN</th>
                  )}
                  {showParticipantColumns.mail && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  )}
                  {selectedTheme && renderEmargementColumns()}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant, index) => (
                  <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="text" 
                        value={participant.nomPrenom} 
                        onChange={(e) => {
                          const updatedParticipants = [...participants];
                          updatedParticipants[index].nomPrenom = e.target.value;
                          setParticipants(updatedParticipants);
                        }} 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                    </td>

                    {showParticipantColumns.CIN && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="text" 
                          value={participant.CIN} 
                          onChange={(e) => {
                            const updatedParticipants = [...participants];
                            updatedParticipants[index].CIN = e.target.value;
                            setParticipants(updatedParticipants);
                          }} 
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                      </td>
                    )}
                    
                    {showParticipantColumns.mail && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="email" 
                          value={participant.mail} 
                          onChange={(e) => {
                            const updatedParticipants = [...participants];
                            updatedParticipants[index].mail = e.target.value;
                            setParticipants(updatedParticipants);
                          }} 
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                      </td>
                    )}
                    
                    {selectedTheme && renderEmargementCells(participant)}

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeParticipant(participant.id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                        title="Supprimer"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiBriefcase className="mr-2 text-teal-500" />
              Formateur
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nom et prénom</label>
                <input 
                  type="text" 
                  name="nomPrenom"
                  value={formData.formateur.nomPrenom} 
                  onChange={handleFormateurChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">CIN N°</label>
                <input 
                  type="text" 
                  name="cin"
                  value={formData.formateur.cin} 
                  onChange={handleFormateurChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiHome className="mr-2 text-teal-500" />
              Entreprise bénéficiaire
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nom de l'entreprise</label>
                <input 
                  type="text" 
                  name="entrepriseBeneficiaire"
                  value={formData.entrepriseBeneficiaire} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Co-organisateurs</label>
                <p className="text-sm text-gray-500 mb-2">
                  Si le séminaire est co-organisé avec d'autres opérateurs de formation, indiquez-les ci-dessous :
                </p>
                <textarea 
                  name="coOrganisateurs"
                  value={formData.coOrganisateurs} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

    
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleFormSubmit} 
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              <FiSave className="mr-2" />
              Enregistrer
            </button>
            
            <button 
              onClick={generatePDF} 
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              <FiDownload className="mr-2" />
              Exporter PDF
            </button>
            
            <button 
              onClick={generateWordDocument} 
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              <FiPrinter className="mr-2" />
              Exporter Word
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeuillePresence;