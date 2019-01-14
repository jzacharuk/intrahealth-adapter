/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const Patient = require('../../src/classes/Patient');

const patient = new Patient();

describe('Patient JSON validation scenarios', () => {
  it('should respond with success for valid JSON', () => {
    const valid = patient.validate({
      message_type: 'Patient',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
      emr_reference: '',
      operation: 'active',
      clinic_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
    });
    // if (!valid) console.log(validateClinic.errors);
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = patient.validate({
      message_type: 'Patient',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
      emr_reference: '',
      operation: 'active',
      no_clinic_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].keyword, 'required');
    assert.equal(valid.errors[0].params.missingProperty, 'clinic_emr_id');
    assert.equal(valid.errors[0].message, 'should have required property \'clinic_emr_id\'');
  });
});
