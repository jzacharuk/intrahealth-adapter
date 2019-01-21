/* eslint-env */
/* jshint esversion: 6 */
const Shared = require('./Shared');
const schema = require('../schemas/Practitioner.json');

module.exports = class Practitioner {
  static getMessageFields() {
    return [
      'clinic_emr_id',
      'name',
      'identifier',
      'identifier_type',
      'emr_id',
      'emr_reference',
      // 'role',
    ];
  }

  static getMessageType() {
    return 'Practitioner';
  }

  static getSchemaId() {
    return 'Practitioner.json';
  }

  static getSchema() {
    return schema;
  }

  static selectByEmrId(dbClient, emrId, clinicId, callback) {
    dbClient.query({
      text: `
        SELECT * FROM universal.practitioner
        WHERE emr_id = $1 and clinic_id = $2; `,
      values: [
        emrId,
        clinicId,
      ],
    }, (err, res) => {
      if (err) {
        callback(err, null);
      } else if (res.rows.length > 1) {
        callback(`multiple practitioner rows found for emr_id: ${emrId}`, null);
      } else {
        callback(err, res.rows.length ? res.rows[0] : null);
      }
    });
  }

  static insert(dbClient, ins, clinicId, callback) {
    dbClient.query({
      text: `INSERT INTO universal.practitioner(
        clinic_id, name, identifier, identifier_type, emr_id, emr_reference)
        VALUES( $1 , $2 , $3 , $4 , $5 , $6 ) RETURNING id; `,
      values: [
        clinicId,
        ins.name,
        ins.identifier,
        ins.identifier_type,
        ins.emr_id,
        ins.emr_reference,
        // ins.role,
      ],
    }, (err, res) => {
      callback(err, res.rows[0].id);
    });
  }

  static update(dbClient, upd, callback) {
    dbClient.query({
      text: `
      UPDATE universal.practitioner
      SET name = $3 , identifier = $4 , identifier_type = $5 , emr_reference = $6
        WHERE id = $1 and emr_id = $2 `,
      values: [
        upd.id,
        upd.emr_id,
        upd.name,
        upd.identifier,
        upd.identifier_type,
        upd.emr_reference,
        // upd.role,
      ],
    }, (err, res) => {
      if (err) {
        callback(err);
      } else if (res.rowCount > 1) {
        callback(`multiple practitioner rows found for emr_id: ${upd.emr_id}`, null);
      } else {
        callback(null);
      }
    });
  }

  static delete(dbClient, del, callback) {
    dbClient.query({
      text: 'DELETE FROM universal.practitioner WHERE id = $1 AND emr_id = $2 ;',
      values: [del.id, del.emr_id],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  static compare(comp, curr) {
    return Shared.compare(comp, curr, this.getMessageFields());
  }
};
