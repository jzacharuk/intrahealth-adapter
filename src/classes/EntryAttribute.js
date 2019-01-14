/* eslint-env and, mocha */
/* jshint esversion: 6 */

// import Message from './Message';

const Ajv = require('ajv');
const Message = require('./Message');

module.exports = class EntryAttribute extends Message {
  constructor() {
    super();
    this.message_type = 'Entry Attribute';
    this.schemaId = 'EntryAttribute.json';

    this.schema = {
      $id: this.schemaId,
      type: 'object',
      required: [
        'message_type',
        'entry_emr_id',
        'attribute_id',
        'emr_id',
        'operation',
      ],
      properties: {
        message_type: {
          type: 'string',
          enum: [this.message_type],
        },
        entry_emr_id: {
          type: 'string',
          description: 'Refers to the entry that this attribute pertains to.',
        },
        attribute_id: {
          type: 'number',
          description: 'The attribute that is being described.',
        },
        code_system: {
          type: 'string',
          description: 'The name of the system that defines the code value.',
        },
        code_value: {
          type: 'string',
          description: 'A code value for the attribute. Code system must be populated.',
        },
        text_value: {
          type: 'string',
          description: 'A text value for the attribute.',
        },
        date_value: {
          type: 'string',
          format: 'date',
          description: 'A date value for the attribute.',
        },
        boolean_value: {
          type: 'boolean',
          description: 'A boolean value for the attribute.',
        },
        numeric_value: {
          type: 'number',
          description: 'A numeric value for the attribute.',
        },
        emr_id: {
          $ref: 'Shared.json#/definitions/emr_id',
        },
        emr_reference: {
          type: 'string',
          description: 'No set purpose. For use by the EMR adapter.',
        },
        emr_effective_date: {
          type: 'string',
          format: 'date-time',
          description: 'The date and time that the attribute was effective within the EMR for the entry.',
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
