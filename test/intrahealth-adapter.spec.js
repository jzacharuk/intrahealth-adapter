/* eslint-env and, mocha, chai */
/* eslint-disable no-unused-expressions */
/*  i had to add this to not error expect(res).to.be.json; statements  */
/* jshint esversion: 6 */
/* jshint -W030 */
/* jshint expr:true */
const chai = require('chai');
const chaiHttp = require('chai-http');
const pg = require('pg');
const dbDefaults = require('../src/db/defaults.json');
const testData = require('./data');

// const { assert } = chai.assert;
const assert = chai.assert;
const expect = chai.expect;
const apiEndpoint = 'http://localhost:3000';
const uri = '/message/';
chai.use(chaiHttp);

const pool = new pg.Pool(dbDefaults);

/*
invalid record
{
  "record_type": "State",
  "emr_id": "4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home",
  "emr_reference": "",
  "operation": "active",
  "effective_date": "2018-10-01T15:31:29.6680000",
  "record_emr_id": "4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home",
  "record_type": "entry",
  "state": "active"
},

what to do if effective dates are out of order?
This probably should never happen
if a message fails that has to be handled
if the message timestamp < the database effective dateTime, then fail

There will maybe be a future case where clinic database needs to be created:

API response should report back with a same length array with a
report of what happened. INSERTED / UPDATED / NO CHANGE

*/

describe('intrahealth-adapter', () => {
  describe('POST /message/', () => {
    before('Wipe database to prepare for testing.', (done) => {
      // TODO: make sure that the API is up.
      const wipeQuery = `
        DELETE FROM universal.attribute;
        DELETE FROM universal.entry;
        DELETE FROM universal.entry_attribute;
        DELETE FROM universal.patient;
        DELETE FROM universal.patient_practitioner;
        DELETE FROM universal.practitioner;
        DELETE FROM universal.state;
        DELETE FROM universal.clinic;
      `;
      pool.connect((connErr, client, release) => {
        if (connErr) {
          release();
          done(connErr);
        }
        client.query({
          text: wipeQuery,
        }, (err, res) => {
          release();
          pool.end();
          if (err) done(err);
          if (res) done();
        });
      });
    });
    describe('negative tests, error handling scenarios', () => {
      it('does not allow HTTP GET, returns 404', (done) => { // <= Pass in done callback
        chai.request(apiEndpoint)
          .get(uri)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(404);
            expect(res).to.be.json;
            expect(res.body.error).to.equal('Resource not found');
            done();
          });
      });
      it('does not allow any other path, returns 404', (done) => { // <= Pass in done callback
        chai.request(apiEndpoint)
          .post('/doesnotexist/')
          .send({
            dummy: 'input',
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(404);
            expect(res).to.be.json;
            expect(res.body.error).to.equal('Resource not found');
            done();
          });
      });
      it('should respond with 415 and the error message on invalid JSON ', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .set('Content-Type', 'application/json')
          .send('<xml>not JSON</xml>')
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(415);
            expect(res).to.be.json;
            expect(res.body.error).to.equal('SyntaxError: Unexpected token < in JSON at position 0');
            done();
          });
      });
      it('should respond with 400 Unexpected message format for schema validation', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send([{
            message_type: 'Clinic',
            emr_id: '439946DE1FEE4529B9A2D90533F811C6',
            emr_reference: '',
            operation: 'active',
            emr: 'EMR Name',
            no_hdc_reference: 'PRAC1',
            name: 'Clinic One',
          }])
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body.error).to.equal('Unexpected message format.');
            expect(res.body.errors[0].keyword).to.equal('required');
            expect(res.body.errors[0].params.missingProperty).to.equal('hdc_reference');
            expect(res.body.errors[0].message).to.equal('should have required property \'hdc_reference\'');
            done();
          });
      });
      it('should respond with 400 Unexpected message format for not an array', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send({
            message_type: 'Clinic',
            emr_id: '439946DE1FEE4529B9A2D90533F811C6',
            emr_reference: '',
            operation: 'active',
            emr: 'EMR Name',
            no_hdc_reference: 'PRAC1',
            name: 'Clinic One',
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body.error).to.equal('Unexpected message format.');
            expect(res.body.errors[0].keyword).to.equal('type');
            expect(res.body.errors[0].message).to.equal('should be array');
            done();
          });
      });
      it.skip('should respond with 422 The message received was valid JSON and matches the required JSON Schema; however, the message could not be processed for another reason.', (done) => {
        /* this could be when the timestamp is old,
        or if the id referenced in another message part didn't match */
        chai.request(apiEndpoint)
          .post(uri)
          .send({
            message_type: 'Clinic',
            emr_id: '439946DE1FEE4529B9A2D90533F811C6',
            emr_reference: '',
            operation: 'active',
            emr: 'EMR Name',
            no_hdc_reference: 'PRAC1',
            name: 'Clinic One',
          })
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body.errors[0].keyword).to.equal('required');
            expect(res.body.errors[0].params.missingProperty).to.equal('hdc_reference');
            expect(res.body.errors[0].message).to.equal('should have required property \'hdc_reference\'');
            done();
          });
      });
    });
    // Clinic specific test cases
    describe('Clinic ', () => {
      it('should successfully insert a Clinic record', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.clinicInsert)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.clinicInsert.length);
            expect(res.body[0].result).to.equal('Inserted');
            done();
          });
      });
      it('should successfully update a record', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.clinicUpdate)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.clinicUpdate.length);
            expect(res.body[0].result).to.equal('Updated');
            done();
          });
      });
      it('should successfully do nothing if no changes', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.clinicUpdate)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.clinicUpdate.length);
            expect(res.body[0].result).to.equal('No change');
            done();
          });
      });
    });
    describe('Practitioner ', () => {
      it('should handle failing clinic', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.practitionerBadClinic)
          .end((err, res) => {
            if (err) done(err);
            if (err) done(err);
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body.error).to.equal('A clinic_emr_id is required.');
            done();
          });
      });
      it('should successfully insert a record', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.practitionerInsert)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.practitionerInsert.length);
            expect(res.body[1].result).to.equal('Inserted');
            done();
          });
      });
      it('should successfully update a record', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.practitionerUpdate)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.practitionerUpdate.length);
            expect(res.body[1].result).to.equal('Updated');
            done();
          });
      });
      it('should successfully do nothing if no changes', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.practitionerUpdate)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.practitionerUpdate.length);
            expect(res.body[0].result).to.equal('No change');
            done();
          });
      });
    });
    describe('Patient ', () => {
      it('should handle failing clinic', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.patientBadClinic)
          .end((err, res) => {
            if (err) done(err);
            if (err) done(err);
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body.error).to.equal('A clinic_emr_id is required.');
            done();
          });
      });
      it('should successfully insert a record', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.patientInsert)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.patientInsert.length);
            expect(res.body[1].result).to.equal('Inserted');
            done();
          });
      });
      it('should successfully update a record', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.patientUpdate)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.patientUpdate.length);
            expect(res.body[1].result).to.equal('Updated');
            done();
          });
      });
      it('should successfully do nothing if no changes', (done) => {
        chai.request(apiEndpoint)
          .post(uri)
          .send(testData.patientUpdate)
          .end((err, res) => {
            if (err) done(err);
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.equal(true);
            expect(res.body).to.have.lengthOf(testData.patientUpdate.length);
            expect(res.body[0].result).to.equal('No change');
            done();
          });
      });
    });
    describe.skip('Entry ', () => {
      it('should handle Patient does not exist', () => {
        // QUESTION: how should this be handled?
        assert.deepEqual('actual', 'expected');
      });
      it('should handle Entry does not exist', () => {
        // QUESTION: how should this be handled?
        assert.deepEqual('actual', 'expected');
      });
      it('should successfully insert a record', () => {
        assert.deepEqual('actual', 'expected');
      });
      it('should successfully update a record', () => {
        assert.deepEqual('actual', 'expected');
      });
      it('should successfully do nothing if no changes', () => {
        assert.deepEqual('actual', 'expected');
      });
    });
    describe.skip('Entry Attribute ', () => {
      it('should handle Clinic does not exist', () => {
        // QUESTION: how should this be handled?
        /*
          segments are in order so parent/child, so it has to fully succeed
          https: //node-postgres.com/features/transactions
          the whole POST message is a transaction.

          everything should be synchronous
          there will never be a concurrent call for the same clinic
        */
        assert.deepEqual('actual', 'expected');
      });
      it('should handle Patient does not exist', () => {
        // QUESTION: how should this be handled?

        assert.deepEqual('actual', 'expected');
      });
      it('should handle Entry does not exist', () => {
        // QUESTION: how should this be handled?
        assert.deepEqual('actual', 'expected');
      });
      it('should successfully insert a record (no latest)', () => {
        assert.deepEqual('actual', 'expected');
      });
      it('should successfully update a record (latest found)', () => {
        assert.deepEqual('actual', 'expected');
      });
      it('should successfully do nothing if no changes', () => {
        assert.deepEqual('actual', 'expected');
      });
    });
  });
});
