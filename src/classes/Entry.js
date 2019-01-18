/* eslint-env */
/* jshint esversion: 6 */
const path = require('path');
const fs = require('fs');
const Shared = require('./Shared');

module.exports = class Entry {
  static getMessageFields() {
    // TODO: set to right fields for Entry
    return [
      'patient_emr_id',
      'emr_table',
      'emr_id',
      'entry_type_id',
      'emr_reference',
    ];
  }

  static getMessageType() {
    return 'Entry';
  }

  static getSchemaId() {
    return 'Entry.json';
  }

  static getSchema() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/Entry.json')));
  }

  static selectByEmrId(dbClient, emrId, callback) {
    dbClient.query({
      text: 'SELECT id, patient_id, entry_type_id, emr_table, emr_id, emr_reference FROM universal.entry WHERE emr_id = $1;',
      values: [emrId],
    }, (err, res) => {
      callback(err, res.rows.length ? res.rows[0] : null);
    });
  }

  static insert(dbClient, ins, callback) {
    dbClient.query({
      text: 'INSERT INTO universal.entry ( patient_id, entry_type_id, emr_table, emr_id, emr_reference) VALUES( $1 , $2 , $3 , $4 , $5 ) RETURNING id ;',
      values: [ins.patient_id, ins.entry_type_id, ins.emr_table, ins.emr_id, ins.emr_reference],
    }, (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, res.rows[0].id);
      }
    });
  }

  static update(dbClient, upd, callback) {
    dbClient.query({
      text: 'UPDATE universal.entry SET patient_id = $3 , entry_type_id = $4 , emr_table = $5 , emr_reference = $6 WHERE id = $1 AND emr_id = $2;',
      values: [upd.patient_emr_id, upd.entry_type_id, upd.emr_table, upd.emr_reference],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  static delete(dbClient, del, callback) {
    dbClient.query({
      text: 'DELETE FROM universal.entry WHERE id = $1 AND emr_id = $2 ;',
      values: [del.id, del.emr_id],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  static compare(comp, curr) {
    return Shared.compare(comp, curr, this.getMessageFields());
  }
};
