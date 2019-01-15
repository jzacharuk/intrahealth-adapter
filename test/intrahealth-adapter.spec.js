/* eslint-env and, mocha, chai */
/* eslint-disable no-unused-expressions */
/*  i had to add this to not error expect(res).to.be.json; statements  */
/* jshint esversion: 6 */
/* jshint -W030 */
/* jshint expr:true */
const chai = require('chai');
const chaiHttp = require('chai-http');

// const { assert } = chai.assert;
const assert = chai.assert;
const expect = chai.expect;
const apiEndpoint = 'http://localhost:3000';

chai.use(chaiHttp);

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
    before('Wipe database to prepare for testing.', () => {
      // make sure that the API is up.
      // TODO: Wipe database.
    });
    describe.only('negative tests, error handling scenarios', () => {
      it('does not allow HTTP GET, returns 404', (done) => { // <= Pass in done callback
        chai.request(apiEndpoint)
          .get('/message/')
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
          .post('/message/')
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
      it('should respond with 400 Unexpected message format ', (done) => {
        chai.request(apiEndpoint)
          .post('/message/')
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
      it('should respond with 422 The message received was valid JSON and matches the required JSON Schema; however, the message could not be processed for another reason.', (done) => {
        /* this could be when the timestamp is old,
        or if the id referenced in another message part didn't match */
        chai.request(apiEndpoint)
          .post('/message/')
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
    describe('Clinic ', () => {
      it('should successfully insert a Clinic record', (done) => {
        chai.request(apiEndpoint)
          .post('/message/')
          .send([{
            message_type: 'Clinic',
            emr_id: '439946DE1FEE4529B9A2D90533F811C6',
            emr_reference: '',
            operation: 'active',
            emr: 'EMR Name',
            hdc_reference: 'PRAC1',
            name: 'Clinic One',
          }])
          .end((err, res) => {
            if (err) done(err);
            // console.log(JSON.stringify(res.body));
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            // expect(res.body.status).to.equal('success');
            done();
          });
      });
      it('should successfully update a record', () => {
        assert.deepEqual('actual', 'expected');
      });
      it('should successfully do nothing if no changes', () => {
        assert.deepEqual('actual', 'expected');
      });
    });
    describe('Practitioner ', () => {
      it('should handle failing clinic', () => {
        // QUESTION: what does failing clinic mean?
        /*
        notes from teleconference,
        first record should be clinic
        if it's not and the id referenced in later records doesn't exist
        */
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
    describe('Patient ', () => {
      it('should handle failing clinic', () => {
        // QUESTION: what does failing clinic mean?
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
    describe('Entry ', () => {
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
    describe('Entry Attribute ', () => {
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
