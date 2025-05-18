import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Comment {
  id_avis: number;
  commentaire: string;
  note: number;
  date_creation: string;
  participant_nom: string;
  formateur_nom: string;
  date_debut: string;
  date_fin: string;
  stars: {
    full: number;
    half: number;
    empty: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    comments: Comment[];
    averageRating: number;
    totalComments: number;
    averageStars: {
      full: number;
      half: number;
      empty: number;
    };
  };
}

interface ThemeCommentsProps {
  themeId: number;
  themeName: string;
}

const ThemeComments: React.FC<ThemeCommentsProps> = ({ themeId, themeName }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [averageStars, setAverageStars] = useState({ full: 0, half: 0, empty: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/${themeId}/comments`
        );
        
        if (!response.data.success || !response.data.data) {
          throw new Error('Réponse API invalide');
        }

        const { comments, averageRating, averageStars } = response.data.data;
        
        setComments(comments || []);
        setAverageRating(averageRating || 0);
        setAverageStars(averageStars || { full: 0, half: 0, empty: 0 });
      } catch (err:any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [themeId]);

  const renderStars = (stars: { full: number; half: number; empty: number }) => {
    const starElements = [];
    
    // Ajouter les étoiles pleines
    for (let i = 0; i < stars.full; i++) {
      starElements.push(<StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />);
    }
    
    // Ajouter la demi-étoile si nécessaire
    if (stars.half > 0) {
      starElements.push(<StarIcon key="half" className="h-5 w-5 text-yellow-400" />);
    }
    
    // Ajouter les étoiles vides
    for (let i = 0; i < stars.empty; i++) {
      starElements.push(<StarOutlineIcon key={`empty-${i}`} className="h-5 w-5 text-yellow-400" />);
    }

    return starElements;
  };

  if (loading) return <div className="text-center py-8">Chargement des commentaires...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Erreur: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Commentaires pour: {themeName}</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Note moyenne</h3>
        <div className="flex items-center">
          <div className="flex mr-2">
            {renderStars(averageStars)}
          </div>
          <span className="text-gray-700">
            {averageRating.toFixed(1)}/5 ({comments.length} commentaires)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">Aucun commentaire disponible pour ce thème.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id_avis} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{comment.participant_nom}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.date_creation).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex">
                  {renderStars(comment.stars)}
                </div>
              </div>
              <p className="text-gray-700 mb-2">{comment.commentaire}</p>
              <p className="text-sm text-gray-500">
                Session avec {comment.formateur_nom} du {new Date(comment.date_debut).toLocaleDateString()} au {new Date(comment.date_fin).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThemeComments;