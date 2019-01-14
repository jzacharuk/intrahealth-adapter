/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
// const { assert } = chai.assert;
const assert = chai.assert;

const EntryAttribute = require('../../src/classes/EntryAttribute');

const entryAttribute = new EntryAttribute();

describe('Entry Attribute JSON validation scenarios', () => {
  it('should respond with success for valid JSON', () => {
    /* I removed "entry_type_id" from required.
    It's in the Universal schema doc,
    but not the Specification or sample request. */
    const valid = entryAttribute.validate({
      message_type: 'Entry Attribute',
      entry_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home\\001.006',
      emr_reference: '',
      operation: 'active',
      attribute_id: 1.006,
      emr_effective_date: '2018-10-01T22:31:29.6680000Z',
      text_value: '104',
    });
    // if (!valid) console.log(validateClinic.errors);
    assert.isTrue(valid.success);
  });
  it('should respond with error for invalid JSON', () => {
    const valid = entryAttribute.validate({
      message_type: 'Entry Attribute',
      no_entry_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home\\001.006',
      emr_reference: '',
      operation: 'active',
      attribute_id: 1.006,
      emr_effective_date: '2018-10-01T22:31:29.6680000Z',
      text_value: '104',
    });

    assert.isFalse(valid.success);
    assert.isArray(valid.errors);
    assert.equal(valid.errors[0].keyword, 'required');
    assert.equal(valid.errors[0].params.missingProperty, 'entry_emr_id');
    assert.equal(valid.errors[0].message, 'should have required property \'entry_emr_id\'');
  });
});
