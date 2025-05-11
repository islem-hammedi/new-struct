const db = require('../../connect');

exports.findAllFormateurs = async () => {
  const query = `
    SELECT f.*, 
      GROUP_CONCAT(DISTINCT fp.chemin) AS fiches_prg,
      GROUP_CONCAT(DISTINCT cs.chemin) AS cours_session
    FROM formateur f
    LEFT JOIN fiche_prg fp ON f.id_formateur = fp.id_formateur
    LEFT JOIN cours_session cs ON f.id_formateur = cs.id_formateur
    GROUP BY f.id_formateur
  `;
  
  const [results] = await db.promise().query(query);
  return results.map(row => ({
    ...row,
    fiche_prg: row.fiches_prg ? row.fiches_prg.split(',')[0] : null,
    themes_a_enseigner: row.themes_a_enseigner || "Aucun thème"
  }));
};

exports.getFormateurPdfPaths = async (formateurId) => {
  const [results] = await db.promise().query(
    `SELECT cv, fiche_prg.chemin 
     FROM formateur
     LEFT JOIN fiche_prg ON formateur.id_formateur = fiche_prg.id_formateur
     WHERE formateur.id_formateur = ?`,
    [formateurId]
  );
  
  return results
    .map(row => [row.cv, row.chemin])
    .flat()
    .filter(Boolean)
    .map(chemin => path.join(__dirname, '../../../uploads', chemin));
};

exports.getFormateurFiles = async (id) => {
  const [result] = await db.promise().query(
    'SELECT cv FROM formateur WHERE id_formateur = ?', 
    [id]
  );
  return result[0] || {};
};

exports.deleteFormateur = async (id) => {
  await db.promise().query('DELETE FROM formateur WHERE id_formateur = ?', [id]);
};