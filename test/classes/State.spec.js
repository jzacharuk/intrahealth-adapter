/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const State = require('../../src/classes/State');

const state = new State();

describe('State JSON validation scenarios', () => {
  it('should respond with success for valid JSON', () => {
    const valid = state.validate({
      message_type: 'State',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      effective_date: '2018-05-28T15:59:34.5980000Z',
      /*
        I added a Z because RFC3339 requires that you include
        either a time zone offset or a Z to indicate UTC
        it was already correct on emr_effective_date
      */
      record_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      record_type: 'clinic',
      state: 'active',
    });
    /* if (!valid.success) console.log(valid.errors); */
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = state.validate({
      message_type: 'State',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      effective_date: '2018-05-28T15:59:34.5980000',
      record_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      record_type: 'clinic',
      no_state: 'active',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].keyword, 'required');
    assert.equal(valid.errors[0].params.missingProperty, 'state');
    assert.equal(valid.errors[0].message, 'should have required property \'state\'');
  });
});
