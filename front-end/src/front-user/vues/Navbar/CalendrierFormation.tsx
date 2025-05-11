import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Worker, Viewer } from '@react-pdf-viewer/core'; // Import des composants nécessaires
import '@react-pdf-viewer/core/lib/styles/index.css'; // Import des styles de react-pdf-viewer

type CalendrierType = {
    id: number;
    domaine: string;
    duree: number;
    type: string;
    lieu: string;
    formateur: string;
    theme: string;
    code: string;
    mois: string;
    date_debut: string;
    date_fin: string;
    fiche_prg_chemin: string;
    cv: string;
};
type FormationDetails = {
    theme: string;
    type_session: string;
    lieu: string;
    nom_complet: string;
    code: string;
    duree: number;
    date_debut: string;
    date_fin: string;
    fiche_prg_chemin: string;
    cv: string;
};
const CalendrierFormation = () => {
    const [calendrier, setCalendrier] = useState<CalendrierType[]>([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [selectedFormation, setSelectedFormation] = useState<FormationDetails | null>(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/calendrierFormation`)
            .then((res) => res.json())
            .then((data: CalendrierType[]) => setCalendrier(data))
            .catch((err) => console.error("Erreur :", err));
    }, []);

    const allMonths = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    const getDisplayedMonths = () => allMonths.slice(currentMonthIndex, currentMonthIndex + 6);

    const nextMonths = () => {
        if (currentMonthIndex + 6 < allMonths.length) setCurrentMonthIndex(currentMonthIndex + 1);
    };

    const previousMonths = () => {
        if (currentMonthIndex > 0) setCurrentMonthIndex(currentMonthIndex - 1);
    };

    const getMonthFromDate = (dateString: string) => {
        if (!dateString) return -1;
        const date = new Date(dateString);
        return date.getMonth();
    };

    // Fonction pour formater les dates (12 - 15)
    const formatDates = (dateDebut: string, dateFin: string) => {
        if (!dateDebut || !dateFin) return "";
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        return `${debut.getDate()} - ${fin.getDate()}`;
    };
    // Regrouper les formations par domaine
    const groupedByDomaine = calendrier.reduce((acc, item) => {
        if (!acc[item.domaine]) acc[item.domaine] = [];
        acc[item.domaine].push(item);
        return acc;
    }, {} as Record<string, CalendrierType[]>);

    const handleFormationClick = async (formation: CalendrierType) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/calendrierFormation/${formation.id}`);
            
            if (!res.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${res.status}`);
            }
    
            const data = await res.json();
            
            // Créez l'objet FormationDetails avec toutes les propriétés nécessaires
            setSelectedFormation({
                theme: data.theme || formation.theme,
                type_session: data.type_session || formation.type_session,
                lieu: data.lieu || formation.lieu,
                nom_complet: data.nom_complet || formation.nom_complet,
                code: data.code || formation.code,
                duree: data.duree || formation.duree,
                date_debut: data.date_debut || formation.date_debut,
                date_fin: data.date_fin || formation.date_fin,
                fiche_prg_chemin: data.fiche_prg_chemin || formation.fiche_prg_chemin,
                cv: data.fiche_prg_chemin || formation.cv

            });
        } catch (err) {
            console.error("Erreur :", err);
            // Fallback: utilise les données déjà disponibles si l'API échoue
            setSelectedFormation({
                theme: formation.theme,
                type_session: formation.type_session,
                lieu: formation.lieu,
                nom_complet: formation.nom_complet,
                code: formation.code,
                duree: formation.duree,
                date_debut: formation.date_debut,
                date_fin: formation.date_fin,
                fiche_prg_chemin: formation.fiche_prg_chemin, 
                cv: formation.cv

            });
        }
    };
    
    const closeModal = () => setSelectedFormation(null);

    const handleOutsideClick = (e: React.MouseEvent) => {
        // Si le clic est en dehors de la boîte modale, on ferme la modale
        if ((e.target as HTMLElement).id === "modal-overlay") {
            closeModal();
        }
    };    const downloadPDF = () => {
        const input = document.getElementById("calendrier-table");
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("l", "mm", "a4");
            const imgWidth = 290;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
            pdf.save("CalendrierFormation.pdf");
        });
    };

    return (
        <div className="p-5 pt-20 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Calendrier de Formation</h1>

            <div className="overflow-x-auto pt-10 shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={previousMonths} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        disabled={currentMonthIndex === 0}>
                        Mois Précédent
                    </button>
                    <button onClick={nextMonths} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        disabled={currentMonthIndex + 6 >= allMonths.length}>
                        Mois Suivant
                    </button>
                </div>

                <table id="calendrier-table" className="min-w-full bg-white">
                    <thead className="bg-gray-200">
                        <tr className="bg-teal-500 text-white">
                            <th className="p-3 text-sm font-semibold border">Domaine</th>
                            <th className="p-3 text-sm font-semibold border">Thème</th>
                            <th className="p-3 text-sm font-semibold border">Durée (jours)</th>
                            {getDisplayedMonths().map((month, index) => (
                                <th key={index} className="p-3 text-sm font-semibold border">{month}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedByDomaine).map(([domaine, formations], index) => (
                            <React.Fragment key={index}>
                                {formations.map((formation, idx) => (
                                    <tr key={formation.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Afficher le domaine seulement sur la première ligne du groupe */}
                                        {idx === 0 ? (
                                            <td rowSpan={formations.length} className="p-3 text-sm text-gray-700 border bg-gray-200 font-bold">
                                                {domaine}
                                            </td>
                                        ) : null}
                                        <td className="p-3 text-sm text-gray-700 border">{formation.theme}</td>
                                        <td className="p-3 text-sm text-gray-700 border">{formation.duree}</td>
                                        {getDisplayedMonths().map((month, monthIdx) => {
                                            const monthIndex = currentMonthIndex + monthIdx;
                                            const debutMonth = getMonthFromDate(formation.date_debut);
                                            const finMonth = getMonthFromDate(formation.date_fin);
                                            
                                            // Vérifie si la formation se déroule pendant ce mois
                                            const isInMonth = debutMonth === monthIndex || finMonth === monthIndex || 
                                                             (debutMonth < monthIndex && finMonth > monthIndex);
                                            
                                            return (
                                                <td 
                                                    key={monthIdx} 
                                                    className="p-3 text-sm text-gray-700 border text-center"
                                                    onClick={() => handleFormationClick(formation)}
                                                >
                                                    {isInMonth ? formatDates(formation.date_debut, formation.date_fin) : ""}
                                                </td>
                                           );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedFormation && (
    <div
        id="modal-overlay"
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        onClick={handleOutsideClick}
    >
        <div className="bg-white p-6 rounded-xl shadow-lg w-4/5 max-w-lg max-h-[80vh] overflow-y-auto relative">
            
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Détails de la Formation</h2>
            <p><strong>Formateur:</strong> {selectedFormation.nom_complet}</p>
            <p><strong>Thème:</strong> {selectedFormation.theme}</p>
            <p><strong>Code:</strong> {selectedFormation.code}</p>
            <p><strong>Type:</strong> {selectedFormation.type_session}</p>
            {selectedFormation.type_session === "présentiel" && (
                <p><strong>Lieu:</strong> {selectedFormation.lieu}</p>
            )}
            {selectedFormation.fiche_prg_chemin && (
    <div className="mt-4 w-full max-w-3xl h-[500px] border rounded-lg shadow-md overflow-hidden">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedFormation.fiche_prg_chemin}`} />
                    </Worker>
                </div>
            )}
        </div>
    </div>
)}


                <button onClick={downloadPDF} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors mt-4">
                    Télécharger en PDF
                </button>
            </div>
    );
};

export default CalendrierFormation;