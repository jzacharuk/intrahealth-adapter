/* eslint-env and, mocha */
/* jshint esversion: 6 */

const schema = {
  $id: 'shared.json',
  definitions: {
    message_type: {
      type: 'string',
      enum: [
        'Clinic',
        'State',
        'Practitioner',
        'Patient',
        'Entry',
        'Entry Attribute',
      ],
    },
    id: {
      type: 'string',
    },
    operation: {
      type: 'string',
      enum: [
        'active',
      ],
    },
  },
};

module.exports = {
  schema,
};
