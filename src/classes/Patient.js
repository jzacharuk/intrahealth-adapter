/* eslint-env and, mocha */
/* jshint esversion: 6 */

// import Message from './Message';

const Ajv = require('ajv');
const Message = require('./Message');

module.exports = class Patient extends Message {
  constructor() {
    super();
    this.message_type = 'Patient';
    this.schemaId = 'Patient.json';

    this.schema = {
      $id: this.schemaId,
      type: 'object',
      required: [
        'message_type',
        'clinic_emr_id',
        'emr_id',
        'operation',
      ],
      properties: {
        message_type: {
          type: 'string',
          enum: [this.message_type],
        },
        clinic_emr_id: {
          type: 'string',
          description: 'Refers to the clinic that was the source for the patient record.',
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
