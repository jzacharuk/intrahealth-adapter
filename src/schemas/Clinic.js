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
    'operation',
  ],
  properties: {
    message_type: {
      $ref: 'shared.json#/definitions/message_type',
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
      type: 'string',
      description: 'The unique identifier of the source record within the EMR.',
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
