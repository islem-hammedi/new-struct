class Event {
    constructor({ id,id_personnel, title, date, created_by }) {
      this.id = id;
      this.id_personnel = id_personnel;
      this.title = title;
      this.date = date;
      this.created_by = created_by;
    }
    validate() {
      if (!this.title || !this.date || !this.created_by) {
        throw new Error('Tous les champs (title, date, created_by) sont requis');
      }
    }
  }
  
  module.exports = Event;