/* eslint-env and, mocha */
/* jshint esversion: 6 */

// import Message from './Message';

const Ajv = require('ajv');
const Message = require('./Message');

module.exports = class Entry extends Message {
  constructor() {
    super();
    this.message_type = 'Entry';
    this.schemaId = 'Entry.json';

    this.schema = {
      $id: this.schemaId,
      type: 'object',
      required: [
        'message_type',
        'patient_emr_id',
        'emr_table',
        'emr_id',
        'entry_type_id',
        'operation',
      ],
      properties: {
        message_type: {
          type: 'string',
          enum: [this.message_type],
        },
        patient_emr_id: {
          type: 'string',
          description: 'Refers to the patient that this entry pertains to.',
        },
        emr_table: {
          type: 'string',
          description: 'The table that is the primary source of the record within the EMR.',
        },
        emr_id: {
          $ref: 'Shared.json#/definitions/emr_id',
        },
        emr_reference: {
          type: 'string',
          description: 'No set purpose. For use by the EMR adapter.',
        },
        entry_type_id: {
          type: 'integer',
          description: 'This will refer to the type of entry (e.g. 14).',
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
};
