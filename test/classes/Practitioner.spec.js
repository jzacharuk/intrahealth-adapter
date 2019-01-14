/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const Practitioner = require('../../src/classes/Practitioner');

const practitioner = new Practitioner();

describe('Practitioner JSON validation scenarios', () => {
  it('should respond with success for valid JSON', () => {
    const valid = practitioner.validate({
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
    // if (!valid) console.log(validateClinic.errors);
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = practitioner.validate({
      message_type: 'Practitioner',
      emr_id: 'C6AE71E1CC2D4369B2E5FA2EF65C1761',
      emr_reference: '',
      operation: 'active',
      clinic_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      no_identifier: '01234',
      identifier_type: 'MSP',
      name: 'Provider Temporary',
      role: 'Paramedical;Nurse',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].keyword, 'required');
    assert.equal(valid.errors[0].params.missingProperty, 'identifier');
    assert.equal(valid.errors[0].message, 'should have required property \'identifier\'');
  });
});
