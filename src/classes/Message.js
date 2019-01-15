/* eslint-env and, mocha */
/* jshint esversion: 6 */
module.exports = class Message {
  constructor() {
    this.message_types = [
      'Clinic',
      'State',
      'Practitioner',
      'Patient',
      'Entry',
      'Entry Attribute',
    ];
    this.sharedSchema = {
      $id: 'Shared.json',
      definitions: {
        message_type: {
          type: 'string',
          enum: this.message_types,
        },
        id: {
          type: 'string',
        },
        emr_id: {
          type: 'string',
          readOnly: true,
          description: 'The unique identifier of the source record within the EMR.',
        },
        operation: {
          type: 'string',
          enum: ['active'],
        },
      },
    };
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
