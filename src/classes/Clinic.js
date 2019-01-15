/* eslint-env and, mocha */
/* jshint esversion: 6 */

// import Message from './Message';

const Ajv = require('ajv');
const Message = require('./Message');

module.exports = class Clinic extends Message {
  constructor() {
    super();
    this.message_type = 'Clinic';
    this.schemaId = 'Clinic.json';

    this.schema = {
      $id: this.schemaId,
      type: 'object',
      required: [
        'emr_id',
        'message_type',
        'name',
        'hdc_reference',
        'emr',
        'operation',
      ],
      properties: {
        message_type: {
          type: 'string',
          enum: [this.message_type],
        },
        name: {
          type: 'string',
          description: 'The name of the clinic.',
        },
        hdc_reference: {
          type: 'string',
          description: 'Uniquely identifies the clinic to HDC. This value will be generated and provided by HDC.',
        },
        emr_id: {
          $ref: 'Shared.json#/definitions/emr_id',
        },
        emr_reference: {
          type: 'string',
          description: 'No set purpose. For use by the EMR adapter.',
        },
        emr: {
          type: 'string',
          description: 'Name of the EMR that this clinic is using (e.g. Med Access, MOIS, Oscar, Profile).',
        },
        operation: {
          $ref: 'Shared.json#/definitions/operation',
        },
      },
    };

    this.ajv = new Ajv({
      allErrors: true,
      extendRefs: 'fail',
      verbose: true,
      schemas: [this.sharedSchema, this.schema],
    });

    this.sql = {
      selectById: 'SELECT id, name, hdc_reference, emr_id, emr_reference, emr FROM universal.clinic WHERE emr_id = $1 ;',
      insert: 'INSERT INTO universal.clinic(name, hdc_reference, emr_id, emr_reference, emr) VALUES( $1 , $2 , $3 , $4 , $5) RETURNING id ;',
      update: 'UPDATE universal.clinic SET name = $3 , hdc_reference = $4 , emr_reference = $5 , emr = $6 WHERE id = $1 AND emr_id = $2 ;',
      delete: 'DELETE FROM universal.clinic WHERE id = $1 AND emr_id = $2 ;',
    };
  }

  validate(json2validate) {
    // return super.validate(this.ajv, this.schemaId, json2validate);
    const results = {};
    const validateFunction = this.ajv.getSchema(this.schemaId);
    const valid = validateFunction(json2validate);

    if (valid) {
      results.success = true;
    } else {
      results.success = false;
      results.errors = validateFunction.errors;
    }
    return results;
  }

  selectByEmrId(dbClient, emrId, callback) {
    dbClient.query({
      text: this.sql.selectById,
      values: [emrId],
    }, (err, res) => {
      callback(err, res.rows.length ? res.rows[0] : null);
    });
  }

  insert(dbClient, ins, callback) {
    dbClient.query({
      text: this.sql.insert,
      values: [ins.name, ins.hdc_reference, ins.emr_id, ins.emr_reference, ins.emr],
    }, (err, res) => {
      callback(err, res.rows[0].id);
    });
  }

  update(dbClient, upd, callback) {
    dbClient.query({
      text: this.sql.update,
      values: [upd.id, upd.emr_id, upd.name, upd.hdc_reference, upd.emr_reference, upd.emr],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  delete(dbClient, del, callback) {
    dbClient.query({
      text: this.sql.delete,
      values: [del.id, del.emr_id],
    }, (err, res) => {
      callback(err, res.rowCount);
    });
  }

  static compare(comp, curr) {
    return super.compare(comp, curr, ['emr', 'emr_reference', 'hdc_reference']);
  }
};
