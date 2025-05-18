const db = require('../../connect');
const Session = require('../../models/admin/session');

class CalendrierUserRepository {
    async getCalendrier() {
        try {
            const query = `
                SELECT 
                    s.id_session AS id,
                    f.nom_complet AS formateur,
                    t.theme AS theme,
                    t.code,
                    s.duree AS nbj,
                    DATE_FORMAT(s.date_debut, '%M') AS mois,
                    s.date_debut,
                    s.date_fin,
                    d.domaine AS domaine,
                    s.lieu,
                    s.type_session,
                    s.etat,
                    s.id_formation,
                    s.id_formateur,
                    s.id_theme
                FROM session s
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN formation fo ON s.id_formation = fo.id_formation
                JOIN domaine d ON fo.id_domaine = d.id_domaine
                JOIN theme t ON s.id_theme = t.id_theme
                WHERE s.date_debut IS NOT NULL
                AND s.date_fin IS NOT NULL
                ORDER BY s.date_debut
            `;
            // Exécution de la requête sans destructuration
            const queryResult = await db.query(query);
            
            // Debug: affiche la structure complète du résultat
            console.log('Query result structure:', {
                type: typeof queryResult,
                isArray: Array.isArray(queryResult),
                sampleData: Array.isArray(queryResult) ? queryResult.slice(0, 1) : queryResult
            });

            // Extraction des résultats selon le format retourné par le driver
            let results;
            if (Array.isArray(queryResult)) {
                results = queryResult;
            } else if (queryResult && Array.isArray(queryResult.rows)) {
                results = queryResult.rows;
            } else if (queryResult && typeof queryResult === 'object') {
                results = [queryResult]; // Convertit un objet unique en tableau
            } else {
                results = []; // Fallback sécurisé
            }

            if (!results || results.length === 0) {
                return []; // Retourne un tableau vide si aucun résultat
            }

            // Conversion des résultats en instances de Session
            return results.map(row => {
                try {
                    return new Session({
                        id_session: row.id,
                        date_debut: row.date_debut,
                        date_fin: row.date_fin,
                        lieu: row.lieu,
                        id_formation: row.id_formation,
                        id_formateur: row.id_formateur,
                        id_theme: row.id_theme,
                        type_session: row.type_session,
                        etat: row.etat,
                        // Champs supplémentaires pour l'affichage
                        _formateur: row.formateur,
                        _domaine: row.domaine,
                        _mois: row.mois,
                        _nbj: row.nbj,
                        _theme: row.theme,
                        _code: row.code
                    });
                } catch (error) {
                    console.error('Error creating Session instance:', error);
                    throw new Error('Erreur de format des données de session');
                }
            });

        } catch (err) {
            console.error("Repository Error - getCalendrier:", {
                message: err.message,
                stack: err.stack,
                query: err.sql || "Non disponible"
            });
            throw new Error("Erreur lors de la récupération du calendrier");
        }
    }

    async getDetailCalendrier(id) {
        try {
            if (!id) throw new Error('ID de session manquant');
            
            const query = `
                SELECT 
                    s.*,
                    t.theme,
                    t.code,
                    f.nom_complet,
                    d.domaine AS domaine
                FROM session s
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN formation fo ON s.id_formation = fo.id_formation
                JOIN domaine d ON fo.id_domaine = d.id_domaine
                JOIN theme t ON s.id_theme = t.id_theme
                WHERE s.id_session = ?
            `;
            
            const queryResult = await db.query(query, [id]);
            
            // Extraction des résultats selon le format
            let results;
            if (Array.isArray(queryResult)) {
                results = queryResult;
            } else if (queryResult && Array.isArray(queryResult.rows)) {
                results = queryResult.rows;
            } else if (queryResult && typeof queryResult === 'object') {
                results = [queryResult];
            } else {
                results = [];
            }

            if (results.length === 0) {
                throw new Error('Session non trouvée');
            }

            const row = results[0];
            return new Session({
                id_session: row.id_session,
                date_debut: row.date_debut,
                date_fin: row.date_fin,
                lieu: row.lieu,
                id_formation: row.id_formation,
                id_formateur: row.id_formateur,
                id_theme: row.id_theme,
                fiche_prg: row.fiche_prg,
                type_session: row.type_session,
                etat: row.etat,
                // Informations complémentaires
                _theme: row.nom_theme,
                _code: row.code,
                _formateur: row.nom_complet,
                _domaine: row.domaine
            });

        } catch (err) {
            console.error("Repository Error - getDetailCalendrier:", {
                message: err.message,
                stack: err.stack,
                query: err.sql || "Non disponible"
            });
            throw err;
        }
    }
}

module.exports = CalendrierUserRepository;