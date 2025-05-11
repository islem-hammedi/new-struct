const db = require('../../connect');
const Session = require('../../models/admin/session');

class SessionRepository {
  async create(sessionData) {
    const [result] = await db.query(
      'INSERT INTO session SET ?',
      [sessionData]
    );
    return new Session({ ...sessionData, id_session: result.insertId });
  }

  async update(id_session, updateData) {
    const [result] = await db.query(
      'UPDATE session SET ? WHERE id_session = ?',
      [updateData, id_session]
    );
    return result.affectedRows;
  }

  async delete(id_session, id_formation) {
    const [result] = await db.query(
      'DELETE FROM session WHERE id_session = ? AND id_formation = ?',
      [id_session, id_formation]
    );
    return result.affectedRows;
  }

  async findByFormation(id_formation) {
    const [rows] = await db.query(
      'SELECT * FROM session WHERE id_formation = ?',
      [id_formation]
    );
    return rows.map(row => new Session(row));
  }
}

module.exports = new SessionRepository();