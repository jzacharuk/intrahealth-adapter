/* eslint-env  */
/* jshint esversion: 6 */
const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const fs = require('fs');
const path = require('path');
const Clinic = require('./classes/Clinic');
const Entry = require('./classes/Entry');
const EntryAttribute = require('./classes/EntryAttribute');
const Patient = require('./classes/Patient');
const PatientPractitioner = require('./classes/PatientPractitioner');
const Practitioner = require('./classes/Practitioner');
const State = require('./classes/State');
const Validator = require('./classes/Validator');

const apiReq = new Validator();

const dbDefaults = JSON.parse(fs.readFileSync(path.join(__dirname, 'db/defaults.json')));

const app = express();

const pool = new pg.Pool(dbDefaults);

const jsonParser = bodyParser.json({
  strict: true,
});

app.post('/message/', jsonParser, (req, res) => {
  /*
  1. Validate that the body is valid JSON and parse.
  If not valid, respond with 415 and the error message.
  */
  if (!req.body) {
    res.status(415).json({
      error: 'Invalid JSON request.',
    });
  } else {
    /*
    2. Validate that the body adheres to the JSON Schema.
    If not valid, respond with 400 and the error message, including the list of validation errors.
    */
    const valid = apiReq.validate(req.body);

    if (!valid.success) {
      res.status(400).json({
        error: 'Unexpected message format.',
        errors: valid.errors,
      });
      /* TODO: figure out what errors structure should be
        since those Objects can be really big
        --------------------------------------------------
        errors: [{
          keyword: 'required',
          dataPath: '',
          schemaPath: '#/required',
          params: [Object],
          message: 'should have required property \'hdc_reference\'',
          schema: [Object],
          parentSchema: [Object],
          data: [Object]
        }]
      */
    } else {
      /*
      3. Process each message within the body, one at a time.
      a.Parse the clinic id(emr_id) out of the first message(message_type = “Clinic”).
      b.Create a database connection based on the clinic id or use a cached one
      if it exists.
      */
      let clinicMsg = null;
      if (res.body[0].message_type === 'clinic') {
        clinicMsg = res.body[0];
      } else {
        // TODO: lookup clinic from the first clinc id found in request
        clinicMsg = null;
      }

      if (clinicMsg) {
        pool.connect((connErr, client, release) => {
          if (connErr) {
            release();
            res.status(500).json({
              error: 'Server error connecting to database.',
              errors: [],
            });
          } else {
            // compare, and maybe update
            Clinic.selectByEmrId(client, clinicMsg.emr_id, (err, result) => {
              if (err) {
                release();
                res.status(500).json({
                  error: 'Server error clinic.selectByEmrId.',
                  errors: [],
                });
              } else if (result) {
                // let clinicDbId = result.id;
                Clinic.compare(clinicMsg, result);
              }
            });
          }
        });
      }
      /*
      c.Synchronize the object with the database depending on the message type.
      d.If anything fails, respond with 422.
      4. If everything succeeded, respond with 200.
      */
    }
  }
});

/* general error handling */
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
    errors: [],
  });
});

/* general error handling */
app.post('*', (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
    errors: [],
  });
});

app.use((err, req, res, next) => {
  const stackLine = err.stack.split('\n')[0];
  if (stackLine.split(':')[0] === 'SyntaxError') {
    res.status(415).json({
      error: stackLine,
      errors: [],
    });
  } else {
    // FIXME: use logger
    // console.error(JSON.stringify(err));
    // console.error(err.stack);
    res.status(500).json({
      error: 'Unknown server side error encountered.',
      errors: [],
    });
  }
  next();
});

app.listen(3000);
