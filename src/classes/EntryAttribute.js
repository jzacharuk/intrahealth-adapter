/* eslint-env */
/* jshint esversion: 6 */
const path = require('path');
const fs = require('fs');
const Shared = require('./Shared');

module.exports = class EntryAttribute {
  static getMessageFields() {
    // TODO: set to right fields for Entry
    return ['emr', 'emr_reference', 'hdc_reference'];
  }

  static getMessageType() {
    return 'EntryAttribute';
  }

  static getSchemaId() {
    return 'EntryAttribute.json';
  }

  static getSchema() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/EntryAttribute.json')));
  }

  static selectByEmrId(dbClient, emrId, callback) {
    dbClient.query({
      text: 'SELECT id, name, hdc_reference, emr_id, emr_reference, emr FROM universal.clinic WHERE emr_id = $1 ;',
      values: [emrId],
    }, (err, res) => {
      callback(err, res.rows.length ? res.rows[0] : null);
    });
  }

  static insert(dbClient, ins, callback) {
    dbClient.query({
      text: 'INSERT INTO universal.clinic(name, hdc_reference, emr_id, emr_reference, emr) VALUES( $1 , $2 , $3 , $4 , $5) RETURNING id ;',
      values: [ins.name, ins.hdc_reference, ins.emr_id, ins.emr_reference, ins.emr],
    }, (err, res) => {
      callback(err, res.rows[0].id);
    });
  }

  static update(dbClient, upd, callback) {
    dbClient.query({
      text: 'UPDATE universal.clinic SET name = $3 , hdc_reference = $4 , emr_reference = $5 , emr = $6 WHERE id = $1 AND emr_id = $2 ;',
      values: [upd.id, upd.emr_id, upd.name, upd.hdc_reference, upd.emr_reference, upd.emr],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  static delete(dbClient, del, callback) {
    dbClient.query({
      text: 'DELETE FROM universal.clinic WHERE id = $1 AND emr_id = $2 ;',
      values: [del.id, del.emr_id],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  static compare(comp, curr) {
    return Shared.compare(comp, curr, this.getMessageFields());
  }
};
