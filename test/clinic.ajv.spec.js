/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const validator = require('../src/validator');

describe('Clinic JSON validation scenarios', () => {
  before('load schemas in validator ', () => {
    validator.loadSchemas();
  });
  it('should respond with success for valid JSON', () => {
    const valid = validator.validate({
      message_type: 'Clinic',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC1',
      name: 'Clinic One',
    });
    // if (!valid) console.log(validateClinic.errors);
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = validator.validate({
      message_type: 'Clinic',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      no_hdc_reference: 'PRAC1',
      name: 'Clinic One',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].dataPath, '.message_type');
    assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
  });
});
