/* eslint-env and, mocha */
/* jshint esversion: 6 */
const Ajv = require('ajv');
const Shared = require('./Shared');

const schema = {
  $id: 'Clinic.json',
  type: 'object',
  required: [
    'message_type',
    'name',
    'hdc_reference',
    'emr',
  ],
  properties: {
    message_type: {
      $ref: 'shared.json#/definitions/message_type',
    },
    id: {
      $ref: 'shared.json#/definitions/id',
    },
    name: {
      type: 'string',
    },
    hdc_reference: {
      type: 'string',
    },
    emr_id: {
      type: 'string',
    },
    emr_reference: {
      type: 'string',
    },
    emr: {
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
  const validateClinic = ajv.compile(schema);
  const valid = validateClinic(json2bvalidated);
  const results = {};

  if (valid) {
    results.success = true;
  } else {
    results.success = false;
    results.errors = validateClinic.errors;
  }
  return results;
};

module.exports = {
  schema,
  validate,
};
