/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const PatientPractitioner = require('../../src/classes/PatientPractitioner');

const patientPractitioner = new PatientPractitioner();

describe('Patient JSON validation scenarios', () => {
  it('should respond with success for valid JSON', () => {
    const valid = patientPractitioner.validate({
      message_type: 'Patient Practitioner',
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
      practitioner_emr_id: 'C6AE71E1CC2D4369B2E5FA2EF65C1761',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      operation: 'active',
    });
    // if (!valid) console.log(validateClinic.errors);
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = patientPractitioner.validate({
      message_type: 'Patient Practitioner',
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
      practitioner_emr_id: 'C6AE71E1CC2D4369B2E5FA2EF65C1761',
      no_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      operation: 'active',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].keyword, 'required');
    assert.equal(valid.errors[0].params.missingProperty, 'emr_id');
    assert.equal(valid.errors[0].message, 'should have required property \'emr_id\'');
  });
});
