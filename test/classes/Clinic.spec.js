/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
const pg = require('pg');
const Clinic = require('../../src/classes/Clinic');

const assert = chai.assert;
const pool = new pg.Pool();

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
        return done(connErr);
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
    Clinic.insert(dbClient, clinic2insert, (err, id) => {
      if (err) done(err);
      assert.isString(id);
      sqlId = id;
      done();
    });
  });
  it('should return null if emr_id is not found Clinic.selectByEmrId(emr_id)', (done) => {
    Clinic.selectByEmrId(dbClient, 'doesNotExist', (err, result) => {
      if (err) done(err);
      assert.isNull(result);
      return done();
    });
  });
  it('should find a result by Clinic.selectByEmrId(emr_id)', (done) => {
    Clinic.selectByEmrId(dbClient, '439946DE1FEE4529B9A2D90533F811C6', (err, result) => {
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
    Clinic.update(dbClient, clinic2update, (err, rowsUpdated) => {
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
    Clinic.delete(dbClient, clinic2delete, (err, rowsDeleted) => {
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
