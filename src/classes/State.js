/* eslint-env and, mocha */
/* jshint esversion: 6 */

// import Message from './Message';

const Ajv = require('ajv');
const Message = require('./Message');

module.exports = class State extends Message {
  constructor() {
    super();
    this.message_type = 'State';
    this.schemaId = 'State.json';

    this.schema = {
      $id: this.schemaId,
      type: 'object',
      required: [
        'message_type',
        'record_type',
        'record_emr_id',
        'state',
        'effective_date',
        'emr_id',
        'operation',
      ],
      properties: {
        message_type: {
          type: 'string',
          enum: [this.message_type],
        },
        record_type: {
          type: 'string',
          description: 'Refers to the type of record whose state is being recorded(clinic, practitioner, patient or entry).',
        },
        record_emr_id: {
          type: 'string',
          description: 'The primary key of the record whose state is being recorded.',
        },
        state: {
          type: 'string',
          description: 'Indicates the state of the record within the EMR at a point in time(effective_date). (e.g.Deleted, Deleted in Error, Refuted, Active, etc).If there is no value present, then this record is assumed to be active.',
        },
        effective_date: {
          type: 'string',
          format: 'date-time',
          description: 'The date and time that the record took on the “state” within the EMR.',
        },
        emr_id: {
          $ref: 'Shared.json#/definitions/emr_id',
        },
        emr_reference: {
          type: 'string',
          description: 'No set purpose. For use by the EMR adapter.',
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
