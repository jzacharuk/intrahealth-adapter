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

  static compare(comp, curr, fields) {
    let result = null;
    if (comp.emr_id === curr.emr_id) {
      fields.forEach((field) => {
        if (comp[field] !== curr[field]) {
          result = 'different';
        }
      });
    } else {
      result = 'invalid';
    }
    return result || 'match';
  }
};
