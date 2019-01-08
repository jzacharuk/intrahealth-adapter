/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const clinic = require('../src/schemas/Practitioner');

describe('Clinic JSON validation scenarios', () => {
  it('should respond with success for valid JSON', () => {
    const valid = clinic.validate({
      message_type: 'Practitioner',
      emr_id: 'C6AE71E1CC2D4369B2E5FA2EF65C1761',
      emr_reference: '',
      operation: 'active',
      clinic_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      identifier: '01234',
      identifier_type: 'MSP',
      name: 'Provider Temporary',
      role: 'Paramedical;Nurse',
    });
    if (!valid.success) console.log(valid.errors);
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = clinic.validate({
      message_type: 'Note a message_type',
      emr_id: 'C6AE71E1CC2D4369B2E5FA2EF65C1761',
      emr_reference: '',
      operation: 'active',
      clinic_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      identifier: '01234',
      identifier_type: 'MSP',
      name: 'Provider Temporary',
      role: 'Paramedical;Nurse',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].dataPath, '.message_type');
    assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
  });
});
