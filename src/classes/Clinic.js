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
      selectById: 'SELECT name, hdc_reference, emr_id, emr_reference, emr FROM universal.clinic WHERE id = $1 ;',
      insert: 'INSERT INTO universal.clinic(name, hdc_reference, emr_id, emr_reference, emr) VALUES( $1 , $2 , $3 , $4 , $5) RETURNING id ;',
      update: 'UPDATE universal.clinic SET name = $2 , hdc_reference = $3 , emr_id = $4 , emr_reference = $5 , emr = $6 WHERE id = $1 ;',
      delete: 'DELETE FROM universal.clinic WHERE id = $1 ;',
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

  selectById(dbClient, id) {
    const query = {
      text: this.selectById,
      values: [id],
    };

    // callback
    dbClient.query(query, (err, res) => {
      let returnObj;
      if (err) {
        returnObj = null;
        // console.log(err.stack)
      } else {
        returnObj = res.rows[0];
      }
      return returnObj;
    });
  }

  insert(dbClient, ins, callback) {
    const query = {
      text: this.sql.insert,
      values: [ins.name, ins.hdc_reference, ins.emr_id, ins.emr_reference, ins.emr],
    };

    // callback
    dbClient.query(query, (err, res) => {
      /*
      let returnObj;
      if (err) {
        returnObj = null;
        // console.log(err.stack)
      } else {
        returnObj = res.rows[0];
      }
      */
      callback(err, res.rows[0].id);
    });
  }
};
