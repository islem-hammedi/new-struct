const domaineAdminRepository = require('../../repositories/admin/domaineRepository');

class DomaineAdminService {
   async getAllDomaines() {
  try {
    const results = await domaineAdminRepository.getAllDomaines();
    return results.map(row => ({
      id_domaine: row.id_domaine,
      domaine: row.domaine
    }));
  } catch (error) {
    throw error;
  }
}

    async getThemesByDomaine(id_domaine) {  
        try {
            if (!id_domaine) {
                throw new Error('Paramètre "id_domaine" manquant');
            }
    
            // Convertir en nombre si nécessaire
            const id = Number(id_domaine) || id_domaine;
            
            const results = await domaineAdminRepository.getThemesByDomaine(id);
            return results.map(row => row.theme);
            
            
        } 
        
        catch (error) {console.log('Repository Results:', results);
            throw error;
        }
    }
}

module.exports = new DomaineAdminService();