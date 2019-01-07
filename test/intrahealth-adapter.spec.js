/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');

// const { assert } = chai.assert;
const assert = chai.assert;
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
      // TODO Wipe database.
    });
    describe('negative tests, error handling scenarios', () => {
      it('should respond with 415 and the error message on JSON ', () => {
        const actual = 'postInvalidJSON()'; // TODO
        const expected = {
          error: 'Unexpected token h in JSON at position 0',
        };

        assert.deepEqual(actual, expected);
      });
      it('should respond with 400 Unexpected message format ', () => {
        const actual = 'postInvalidJSON()'; // TODO
        const expected = {
          error: 'Unexpected message format',
          errors: [{
            keyword: 'type',
            dataPath: '.firstName',
            schemaPath: '#/properties/firstName/type',
            params: {
              type: 'string',
            },
            message: 'should be string',
          }],
        };

        assert.deepEqual(actual, expected);
      });
      it('should respond with 422 The message received was valid JSON and matches the required JSON Schema; however, the message could not be processed for another reason.', () => {
        const actual = 'postInvalidJSON()'; // TODO
        const expected = {
          error: 'Unexpected message format',
          errors: [{
            keyword: 'type',
            dataPath: '.firstName',
            schemaPath: '#/properties/firstName/type',
            params: {
              type: 'string',
            },
            message: 'should be string',
          }],
        };

        assert.deepEqual(actual, expected);
      });
    });
    describe('Clinic ', () => {
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
