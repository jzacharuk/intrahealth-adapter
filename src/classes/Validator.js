/* eslint-env and, mocha */
/* jshint esversion: 6 */
const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');
const Shared = require('./Shared');
const Clinic = require('./Clinic');
const Entry = require('./Entry');
const EntryAttribute = require('./EntryAttribute');
const Patient = require('./Patient');
const PatientPractitioner = require('./PatientPractitioner');
const Practitioner = require('./Practitioner');
const State = require('./State');

module.exports = class Validator {
  constructor(msgType) {
    this.schemaArray = [
      Shared.getSchema(),
      Clinic.getSchema(),
      Entry.getSchema(),
      EntryAttribute.getSchema(),
      Patient.getSchema(),
      PatientPractitioner.getSchema(),
      Practitioner.getSchema(),
      State.getSchema(),
      JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/APIRequest.json'))),
    ];

    this.ajv = new Ajv({
      allErrors: true,
      extendRefs: 'fail',
      verbose: true,
      schemas: this.schemaArray,
    });

    const schemaId = msgType ? `${msgType}.json` : 'APIRequest.json';
    this.validationFunction = this.ajv.getSchema(schemaId);
  }

  validate(json2bvalidated) {
    const results = {};
    let validateFunction = null;
    let json2validate = json2bvalidated;
    if (typeof json2bvalidated === 'string') {
      try {
        json2validate = JSON.stringify(json2bvalidated);
      } catch (error) {
        results.success = false;
        results.errors = [error];
      }
    }

    validateFunction = this.validationFunction;
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
