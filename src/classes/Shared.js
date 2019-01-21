/* eslint-env and, mocha */
/* jshint esversion: 6 */
const path = require('path');
const fs = require('fs');

module.exports = class Message {
  // constructor() {}

  static getMessageTypes() {
    return [
      'Clinic',
      'State',
      'Practitioner',
      'Patient',
      'Patient Practitioner',
      'Entry',
      'Entry Attribute',
    ];
  }

  static getSchema() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/Shared.json')));
  }

  static compare(comp, curr, mutFields, keyFields) {
    let result = null;
    if (Array.isArray(mutFields)) {
      mutFields.forEach((field) => {
        if (comp[field] !== curr[field]) {
          result = 'different';
        }
      });
    }
    if (Array.isArray(keyFields)) {
      keyFields.forEach((field) => {
        if (comp[field] !== curr[field]) {
          result = 'invalid';
        }
      });
    }

    return result || 'match';
  }
};
