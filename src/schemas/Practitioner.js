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
    'name',
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
    },
    emr_id: {
      type: 'string',
    },
    emr_reference: {
      type: 'string',
    },
    clinic_emr_id: {
      type: 'string',
    },
    identifier: {
      type: 'string',
    },
    identifier_type: {
      type: 'string',
    },
    role: {
      type: 'string',
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
