/* eslint-env */
/* jshint esversion: 6 */
const Shared = require('./Shared');
const schema = require('../schemas/Patient.json');

module.exports = class Patient {
  static getMessageFields() {
    return ['clinic_emr_id', 'emr_id', 'emr_reference'];
  }

  static getMutableFields() {
    return ['emr_reference'];
  }

  static getKeyFields() {
    /*
      i removed 'clinic_emr_id',
      because the database one i compare
      to does not have it.  If i add
      it back here, need to make sure
      the comparing one has it too.
    */
    return ['emr_id'];
  }

  static getMessageType() {
    return 'Patient';
  }

  static getSchemaId() {
    return 'Patient.json';
  }

  static getSchema() {
    return schema;
  }

  static selectByEmrId(dbClient, emrId, clinicId, callback) {
    dbClient.query({
      text: `
        SELECT * FROM universal.patient
        WHERE emr_id = $1 and clinic_id = $2; `,
      values: [
        emrId,
        clinicId,
      ],
    }, (err, res) => {
      if (err) {
        callback(err, null);
      } else if (res.rows.length > 1) {
        callback(`multiple patient rows found for emr_id: ${emrId}`, null);
      } else {
        callback(err, res.rows.length ? res.rows[0] : null);
      }
    });
  }

  static insert(dbClient, ins, clinicId, callback) {
    dbClient.query({
      text: `INSERT INTO universal.patient(
        clinic_id, emr_id, emr_reference)
        VALUES( $1 , $2 , $3 ) RETURNING id; `,
      values: [
        clinicId,
        ins.emr_id,
        ins.emr_reference,
      ],
    }, (err, res) => {
      callback(err, res.rows[0].id);
    });
  }

  static update(dbClient, upd, callback) {
    dbClient.query({
      text: `UPDATE universal.patient
        SET emr_reference = $3
        WHERE id = $1 and emr_id = $2 `,
      values: [
        upd.id,
        upd.emr_id,
        upd.emr_reference,
      ],
    }, (err, res) => {
      if (err) {
        callback(err);
      } else if (res.rowCount > 1) {
        callback(`multiple patient rows found for emr_id: ${upd.emr_id}`, null);
      } else {
        callback(null);
      }
    });
  }

  static delete(dbClient, del, callback) {
    dbClient.query({
      text: 'DELETE FROM universal.patient WHERE id = $1 AND emr_id = $2 ;',
      values: [del.id, del.emr_id],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  static compare(comp, curr) {
    return Shared.compare(comp, curr, this.getMutableFields(), this.getKeyFields());
  }
};
