/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
const fs = require('fs');
const path = require('path');

// const { assert } = chai.assert;
const assert = chai.assert;

const validator = require('../src/validator');

describe('JSON validation with validator.js using ajv module', () => {
  before('load schemas in validator ', () => {
    validator.loadSchemas();
  });

  describe('API request validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const parsedJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'sampleMessage.json')));
      const valid = validator.validate(parsedJSON);
      // if (!valid) console.log(validateClinic.errors);
      if (!valid.success) {
        fs.writeFileSync(path.join(__dirname, 'sampleErrors.json'), JSON.stringify(valid.errors));
      }
      assert.isTrue(valid.success);
    });
  });

  describe('Clinic JSON validation scenarios', () => {
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
      // assert.equal(valid.errors[0].dataPath, '.message_type');
      // assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
    });
  });

  describe('Practitioner JSON validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const valid = validator.validate({
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
      const valid = validator.validate({
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
      // assert.equal(valid.errors[0].dataPath, '.message_type');
      // assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
    });
  });

  describe('Patient JSON validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const valid = validator.validate({
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
      const valid = validator.validate({
        message_type: 'Patient',
        emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
        emr_reference: '',
        operation: 'active',
        no_clinic_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      });

      assert.isFalse(valid.success);
      assert.isArray(valid.errors);
      // assert.equal(valid.errors[0].dataPath, '.message_type');
      // assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
    });
  });

  describe('Entry JSON validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const valid = validator.validate({
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
      const valid = validator.validate({
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
      // assert.equal(valid.errors[0].dataPath, '.message_type');
      // assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
    });
  });

  describe('Entry Attribute JSON validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const valid = validator.validate({
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
      const valid = validator.validate({
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
      // assert.equal(valid.errors[0].dataPath, '.message_type');
      // assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
    });
  });

  describe('State JSON validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const valid = validator.validate({
        message_type: 'State',
        emr_id: '439946DE1FEE4529B9A2D90533F811C6',
        emr_reference: '',
        operation: 'active',
        effective_date: '2018-05-28T15:59:34.5980000',
        record_emr_id: '439946DE1FEE4529B9A2D90533F811C6',
        record_type: 'clinic',
        state: 'active',
      });
      // if (!valid) console.log(validateClinic.errors);
      assert.isTrue(valid.success);
    });
    it('should respond with error for invalid JSON', () => {
      const valid = validator.validate({
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
      // assert.equal(valid.errors[0].dataPath, '.message_type');
      // assert.equal(valid.errors[0].message, 'should be equal to one of the allowed values');
    });
  });
});
