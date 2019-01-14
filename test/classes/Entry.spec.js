/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const Entry = require('../../src/classes/Entry');

const entry = new Entry();

describe('Entry JSON validation scenarios', () => {
  it('should respond with success for valid JSON', () => {
    const valid = entry.validate({
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: '',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
    });
    // if (!valid) console.log(validateClinic.errors);
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = entry.validate({
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: '',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      no_patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].keyword, 'required');
    assert.equal(valid.errors[0].params.missingProperty, 'patient_emr_id');
    assert.equal(valid.errors[0].message, 'should have required property \'patient_emr_id\'');
  });
});
