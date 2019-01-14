/* eslint-env and, mocha */
/* jshint esversion: 6 */

// import Message from './Message';

const Ajv = require('ajv');
const Message = require('./Message');

module.exports = class Practitioner extends Message {
  constructor() {
    super();
    this.message_type = 'Practitioner';
    this.schemaId = 'Practitioner.json';

    this.schema = {
      $id: this.schemaId,
      type: 'object',
      required: [
        'message_type',
        'clinic_emr_id',
        'identifier',
        'identifier_type',
        'emr_id',
        'operation',
      ],
      properties: {
        message_type: {
          type: 'string',
          enum: [this.message_type],
        },
        name: {
          type: 'string',
          description: 'The name of the practitioner.',
        },
        emr_id: {
          $ref: 'Shared.json#/definitions/emr_id',
        },
        emr_reference: {
          type: 'string',
          description: 'No set purpose. For use by the EMR adapter.',
        },
        clinic_emr_id: {
          type: 'string',
          description: 'Refers to the clinic that the practitioner is within.',
        },
        identifier: {
          type: 'string',
          description: 'The identifier for the practitioner (e.g. 29370).',
        },
        identifier_type: {
          type: 'string',
          description: 'The type of identifier (i.e. MSP, CPSID).',
        },
        role: {
          type: 'string',
          description: 'The role of the practitioner (e.g. Physician, NP, Midwife)',
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
