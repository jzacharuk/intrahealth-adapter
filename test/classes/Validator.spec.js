/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
const fs = require('fs');
const path = require('path');
const Validator = require('../../src/classes/Validator');
// const { assert } = chai.assert;
const assert = chai.assert;
const apiRequest = new Validator();
const clinic = new Validator('Clinic');
const entry = new Validator('Entry');
const entryAttribute = new Validator('EntryAttribute');
const patient = new Validator('Patient');
const practitioner = new Validator('Practitioner');
const patientPractitioner = new Validator('PatientPractitioner');
const state = new Validator('State');

describe('JSON validation with validator.js using ajv module', () => {
  describe('API request validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const parsedJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../sampleMessage.json')));
      const valid = apiRequest.validate(parsedJSON);
      // if (!valid) console.log(validateClinic.errors);
      if (!valid.success) {
        fs.writeFileSync(path.join(__dirname, 'sampleErrors.json'), JSON.stringify(valid.errors));
      }
      assert.isTrue(valid.success);
    });
    // TODO: need some negative cases
  });

  describe('Clinic JSON validation scenarios', () => {
    it('should respond with success for valid JSON', () => {
      const valid = clinic.validate({
        message_type: 'Clinic',
        emr_id: '439946DE1FEE4529B9A2D90533F811C6',
        emr_reference: '',
        operation: 'active',
        emr: 'EMR Name',
        hdc_reference: 'PRAC1',
        name: 'Clinic One',
      });
      assert.isTrue(valid.success);
    });
    it('should respond with error for invalid JSON', () => {
      const valid = clinic.validate({
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
      assert.equal(valid.errors[0].keyword, 'required');
      assert.equal(valid.errors[0].params.missingProperty, 'hdc_reference');
      assert.equal(valid.errors[0].message, 'should have required property \'hdc_reference\'');
    });
  });

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

  describe('Patient Practitioner JSON validation scenarios', () => {
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
});
