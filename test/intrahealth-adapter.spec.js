/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');

// const { assert } = chai.assert;
const assert = chai.assert;

describe('intrahealth-adapter', () => {
  describe('POST /message/', () => {
    before('Wipe database to prepare for testing.', () => {
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
