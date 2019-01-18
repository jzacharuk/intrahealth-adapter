/* eslint-env and, mocha */
/* jshint esversion: 6 */
const chai = require('chai');
const pg = require('pg');
const fs = require('fs');
const path = require('path');
const Entry = require('../../src/classes/Entry');
// const { assert } = chai.assert;
const assert = chai.assert;

const dbDefaults = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/db/defaults.json')));

const pool = new pg.Pool(dbDefaults);

describe('Entry class compare function', () => {
  it('should respond with match if they do', () => {
    const entry1 = {
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: '',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
    };
    const entry2 = entry1;
    assert.equal(Entry.compare(entry1, entry2), 'match');
  });
  it('should respond with different if they are', () => {
    const entry1 = {
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: '',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
    };
    const entry2 = {
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: 'difference',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
    };
    assert.equal(Entry.compare(entry1, entry2), 'different');
  });
  it('should respond with invalid if the emr_id doesn\'t match', () => {
    const entry1 = {
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: '',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
    };
    const entry2 = {
      message_type: 'Entry',
      emr_id: 'DDFF88F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: '',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
    };
    assert.equal(Entry.compare(entry1, entry2), 'invalid');
  });
});

let dbClient = null;
let dbRelease = null;
let sqlId = null;

describe('Entry class SQL validation', () => {
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
    const entry2insert = {
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: '',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
      patient_id: 1234567,
    };
    Entry.insert(dbClient, entry2insert, (err, id) => {
      if (err) done(err);
      assert.isString(id);
      sqlId = id;
      done();
    });
  });
  it('should return null if emr_id is not found Entry.selectByEmrId(emr_id)', (done) => {
    Entry.selectByEmrId(dbClient, 'doesNotExist', (err, result) => {
      if (err) done(err);
      assert.isNull(result);
      return done();
    });
  });
  it('should find a result by Entry.selectByEmrId(emr_id)', (done) => {
    Entry.selectByEmrId(dbClient, '439946DE1FEE4529B9A2D90533F811C6', (err, result) => {
      if (err) done(err);
      assert.equal(result.id, sqlId);
      return done();
    });
  });
  it('should update an existing row', (done) => {
    const entry2update = {
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: 'Updated',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
      patient_id: 1234567,
    };
    Entry.update(dbClient, entry2update, (err, rowsUpdated) => {
      if (err) done(err);
      assert.equal(rowsUpdated, 1);
      done();
    });
  });
  it('should delete an existing row', (done) => {
    const entry2delete = {
      id: sqlId,
      message_type: 'Entry',
      emr_id: '4B3188F376E4DD46AC373F4455B6F1FB\\Address_Home',
      emr_reference: 'Updated',
      operation: 'active',
      emr_table: 'address',
      entry_type_id: 1,
      patient_emr_id: '4B3188F376E4DD46AC373F4455B6F1FB',
      patient_id: 1234567,
    };
    Entry.delete(dbClient, entry2delete, (err, rowsDeleted) => {
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
