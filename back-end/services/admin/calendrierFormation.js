{/*const calendrierFormationRepository = require('../../repositories/admin/calendrierFormation');
const Session = require('../../models/admin/session');

const saveSessions = async (sessionsData) => {
  const sessions = Array.isArray(sessionsData) ? sessionsData : [];
  
  if (sessions.length === 0) {
    throw { message: "Aucune session à enregistrer.", status: 400 };
  }

  // Validation
  const invalidSessions = sessions.filter(session => 
    !session.id_session || !session.date_debut || !session.date_fin || !session.duree
  );

  if (invalidSessions.length > 0) {
    throw { 
      message: `${invalidSessions.length} sessions invalides (champs manquants)`, 
      status: 400 
    };
  }

  const updatedCount = await calendrierFormationRepository.updateSessions(sessions);
  
  return {
    message: `${updatedCount} sessions mises à jour avec succès.`,
    updatedCount,
    data: sessions
  };
};

const getDomainesWithSessions = async () => {
  const rawData = await calendrierFormation.fetchDomainesWithSessions();
  
  if (!rawData || rawData.length === 0) {
    throw { message: "Aucun domaine trouvé.", status: 404 };
  }

  const domainesMap = new Map();

  rawData.forEach((row) => {
    if (!domainesMap.has(row.id_domaine)) {
      domainesMap.set(row.id_domaine, {
        id_domaine: row.id_domaine,
        domaine: row.domaine,
        themes: [],
      });
    }

    const domaine = domainesMap.get(row.id_domaine);
    let theme = domaine.themes.find((t) => t.id_theme === row.id_theme);
    
    if (!theme) {
      theme = {
        id_theme: row.id_theme,
        theme: row.theme,
        code: row.code,
        sessions: [],
      };
      domaine.themes.push(theme);
    }

    if (row.id_session && !theme.sessions.some((s) => s.id_session === row.id_session)) {
      theme.sessions.push(new Session({
        id_session: row.id_session,
        createdAt: row.createdAt
      }));
    }
  });

  return {
    message: "Données récupérées avec succès.",
    data: Array.from(domainesMap.values())
  };
};



const getCurrentYearSessions = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const sessions = await calendrierFormationRepository.getSessionsByYear(currentYear);
    
    // Validation supplémentaire
    if (!Array.isArray(sessions)) {
      throw new Error(`Le repository a retourné un type invalide: ${typeof sessions}`);
    }
    
    return {
      success: true,
      data: {
        year: currentYear,
        count: sessions.length,
        sessions: sessions
      }
    };
  } catch (error) {
    console.error('Erreur dans le service getCurrentYearSessions:', {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: error.message.includes('Erreur du repository') 
        ? error.message 
        : 'Erreur lors de la récupération des sessions'
    };
  }
};

module.exports = {
  saveSessions,
  getDomainesWithSessions,getCurrentYearSessions
};*/}












const calendrierFormationRepository = require('../../repositories/admin/calendrierFormation');
const Session = require('../../models/admin/session');

const saveSessions = async (sessionsData) => {
  const sessions = Array.isArray(sessionsData) ? sessionsData : [];
  
  if (sessions.length === 0) {
    throw { message: "Aucune session à enregistrer.", status: 400 };
  }

  // Validation
  const invalidSessions = sessions.filter(session => 
    !session.id_session || !session.date_debut || !session.date_fin || !session.duree
  );

  if (invalidSessions.length > 0) {
    throw { 
      message: `${invalidSessions.length} sessions invalides (champs manquants)`, 
      status: 400 
    };
  }

  const updatedCount = await calendrierFormationRepository.updateSessions(sessions);
  
  return {
    message: `${updatedCount} sessions mises à jour avec succès.`,
    updatedCount,
    data: sessions
  };
};

const getDomainesWithSessions = async () => {
  const rawData = await calendrierFormationRepository.fetchDomainesWithSessions();
  
  if (!rawData || rawData.length === 0) {
    throw { message: "Aucun domaine trouvé.", status: 404 };
  }

  const domainesMap = new Map();

  rawData.forEach((row) => {
    if (!domainesMap.has(row.id_domaine)) {
      domainesMap.set(row.id_domaine, {
        id_domaine: row.id_domaine,
        domaine: row.domaine,
        themes: [],
      });
    }

    const domaine = domainesMap.get(row.id_domaine);
    let theme = domaine.themes.find((t) => t.id_theme === row.id_theme);
    
    if (!theme) {
      theme = {
        id_theme: row.id_theme,
        theme: row.theme,
        code: row.code,
        sessions: [],
      };
      domaine.themes.push(theme);
    }

    if (row.id_session && !theme.sessions.some((s) => s.id_session === row.id_session)) {
      theme.sessions.push(new Session({
        id_session: row.id_session,
        createdAt: row.createdAt
      }));
    }
  });

  return {
    message: "Données récupérées avec succès.",
    data: Array.from(domainesMap.values())
  };
};

module.exports = {
  saveSessions,
  getDomainesWithSessions
};