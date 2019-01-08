/* eslint-env and, mocha */
/* jshint esversion: 6 */
const Ajv = require('ajv');
const Shared = require('./Shared');

const schema = {
  $id: 'Practitioner.json',
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
      $ref: 'shared.json#/definitions/message_type',
    },
    name: {
      type: 'string',
      description: 'The name of the practitioner.',
    },
    emr_id: {
      type: 'string',
      description: 'The unique identifier of the source record within the EMR.',
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
      $ref: 'shared.json#/definitions/operation',
    },
  },
};

const ajv = new Ajv({
  allErrors: true,
  extendRefs: 'fail',
  verbose: true,
  schemas: [Shared.schema, schema],
});

const validate = (json2bvalidated) => {
  const validatePractitioner = ajv.compile(schema);
  const valid = validatePractitioner(json2bvalidated);
  const results = {};

  if (valid) {
    results.success = true;
  } else {
    results.success = false;
    results.errors = validatePractitioner.errors;
  }
  return results;
};

module.exports = {
  schema,
  validate,
};
