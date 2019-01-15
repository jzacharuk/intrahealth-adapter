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

describe('Clinic class compare function', () => {
  it('should respond with match if they do', () => {
    const clinic1 = {
      message_type: 'Clinic',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC1',
      name: 'Clinic One',
    };
    const clinic2 = clinic1;
    assert.equal(Clinic.compare(clinic1, clinic2), 'match');
  });
  it('should respond with different if they are', () => {
    const clinic1 = {
      message_type: 'Clinic',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC1',
      name: 'Clinic One',
    };
    const clinic2 = {
      message_type: 'Clinic',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC2',
      name: 'Clinic Two',
    };
    assert.equal(Clinic.compare(clinic1, clinic2), 'different');
  });
  it('should respond with invalid if the emr_id doesn\'t match', () => {
    const clinic1 = {
      message_type: 'Clinic',
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC1',
      name: 'Clinic One',
    };
    const clinic2 = {
      message_type: 'Clinic',
      emr_id: '239946DE1FEE4529B9A2D90533F811C3',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC2',
      name: 'Clinic Two',
    };
    assert.equal(Clinic.compare(clinic1, clinic2), 'invalid');
  });
});

let dbClient = null;
let dbRelease = null;
let sqlId = null;

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
      if (err) done(err);
      assert.isString(id);
      sqlId = id;
      done();
    });
  });
  it('should return null if emr_id is not found clinic.selectById(emr_id)', (done) => {
    clinic.selectByEmrId(dbClient, 'doesNotExist', (err, result) => {
      if (err) done(err);
      assert.isNull(result);
      return done();
    });
  });
  it('should find a result by clinic.selectById(emr_id)', (done) => {
    clinic.selectByEmrId(dbClient, '439946DE1FEE4529B9A2D90533F811C6', (err, result) => {
      if (err) done(err);
      assert.equal(result.id, sqlId);
      return done();
    });
  });
  it('should update an existing row', (done) => {
    const clinic2update = {
      id: sqlId,
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC1',
      name: 'Updated Clinic',
    };
    clinic.update(dbClient, clinic2update, (err, rowsUpdated) => {
      if (err) done(err);
      assert.equal(rowsUpdated, 1);
      done();
    });
  });
  it('should delete an existing row', (done) => {
    const clinic2delete = {
      id: sqlId,
      emr_id: '439946DE1FEE4529B9A2D90533F811C6',
      emr_reference: '',
      operation: 'active',
      emr: 'EMR Name',
      hdc_reference: 'PRAC1',
      name: 'Updated Clinic',
    };
    clinic.delete(dbClient, clinic2delete, (err, rowsDeleted) => {
      if (err) done(err);
      assert.equal(rowsDeleted, 1);
      done();
    });
  });
  after('close any connection pools', () => {
    dbRelease();
    pool.end();
  });
});
