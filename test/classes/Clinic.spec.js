/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
const pg = require('pg');
const fs = require('fs');
const path = require('path');
const Clinic = require('../../src/classes/Clinic');
// const { assert } = chai.assert;
const assert = chai.assert;

const dbDefaults = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/db/defaults.json')));

const pool = new pg.Pool(dbDefaults);

const clinic = new Clinic();

describe('Clinic class JSON validation', () => {
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

let dbClient = null;
let dbRelease = null;

describe('Clinic class SQL validation', () => {
  before('get a connection pool', (done) => {
    pool.connect((connErr, client, release) => {
      if (connErr) {
        release();
        done(connErr);
      }
      dbClient = client;
      dbRelease = release;
      done();
    });
  });
  it('should insert a valid row', (done) => {
    const clinic2insert = {
      message_type: 'Clinic',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC1',
      name: 'Mocha Clinic',
    };
    clinic.insert(dbClient, clinic2insert, (err, id) => {
      dbRelease();
      if (err) {
        done(err);
      }
      assert.isString(id);
      return done();
    });
  });
  after('close any connection pools', () => {
    pool.end();
  });
});
