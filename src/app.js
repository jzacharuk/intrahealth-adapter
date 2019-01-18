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
  try {
    /*
    1. Validate that the body is valid JSON and parse.
    If not valid, respond with 415 and the error message.
    */
    if (!req.body) {
      const thrO = {
        httpCode: 415,
        error: 'Invalid JSON request.',
      };
      throw thrO;
    }
    /*
    2. Validate that the body adheres to the JSON Schema.
    If not valid, respond with 400 and the error message, including the list of validation errors.
    */
    const valid = apiReq.validate(req.body);

    if (!valid.success) {
      const thrO = {
        httpCode: 400,
        error: 'Unexpected message format.',
        errors: valid.errors,
      };
      throw thrO;
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
    }
    /*
    3. Process each message within the body, one at a time.
    a.Parse the clinic id(emr_id) out of the first message(message_type = “Clinic”).
    b.Create a database connection based on the clinic id or use a cached one
    if it exists.
    */
    let clinicEmrId = null;
    let firstMessage = null;
    let clinicMsg = null;
    if (Array.isArray(res.body) && res.body.length) {
      firstMessage = res.body[0];
    } else {
      const thrO = {
        httpCode: 400,
        error: 'Unexpected message format',
      };
      throw thrO;
    }
    if (firstMessage.message_type === Clinic.getMessageType()) {
      clinicMsg = firstMessage;
      clinicEmrId = firstMessage.emr_id;
    } else {
      // TODO: lookup clinic from the first clinc id found in request
      const found = false;
      if (found) {
        // set clinicid to found
      } else {
        const thrO = {
          httpCode: 400,
          error: 'A clinic_emr_id is required.',
        };
        throw thrO;
      }
    }

    if (clinicEmrId) {
      // TODO: connect to the database for the clinic
      pool.connect((connErr, client, release) => {
        if (connErr) {
          release();
          const thrO = {
            httpCode: 500,
            error: 'Server error connecting to database.',
          };
          throw thrO;
        }
        // define the rollback function to call if anything fails in transaction
        const shouldAbort = (err) => {
          if (err) {
            // console.error('Error in transaction', err.stack)
            client.query('ROLLBACK', (rbErr) => {
              if (rbErr) {
                // console.error('Error rolling back client', rbErr.stack)
              }
              // release the client back to the pool
              release();
            });
          }
          return !!err;
        };
        // begin the transaction
        client.query('BEGIN', (err) => {
          if (shouldAbort(err)) {
            const thrO = {
              httpCode: 500,
              error: 'transaction BEGIN failed.',
            };
            throw thrO;
          }

          // compare, and maybe update
          Clinic.selectByEmrId(client, clinicEmrId, (selErr, result) => {
            if (shouldAbort(selErr)) {
              release();
              const thrO = {
                httpCode: 500,
                error: 'Server error clinic.selectByEmrId.',
              };
              throw thrO;
            } else if (result) {
              // let clinicDbId = result.id;
              Clinic.compare(clinicMsg, result);

              client.query('COMMIT', (commitErr) => {
                release();
                if (shouldAbort(commitErr)) {
                  const thrO = {
                    httpCode: 500,
                    error: 'COMMIT failed.',
                  };
                  throw thrO;
                }
              });
            }
          });
        });
      });
    }
    /*
    c.Synchronize the object with the database depending on the message type.
    d.If anything fails, respond with 422.
    4. If everything succeeded, respond with 200.
    */
  } catch (thrown) {
    if (thrown.httpCode) {
      const body = {
        error: thrown.error,
      };
      if (thrown.errors) {
        body.errors = thrown.errors;
      }
      res.status(thrown.httpCode).json(body);
    } else {
      res.status(500).json({
        error: 'Unknown server side error encountered.',
      });
    }
  }
});

/* general error handling */
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
  });
});

/* general error handling */
app.post('*', (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
  });
});

app.use((err, req, res, next) => {
  const stackLine = err.stack.split('\n')[0];
  if (stackLine.split(':')[0] === 'SyntaxError') {
    res.status(415).json({
      error: stackLine,
    });
  } else {
    // FIXME: use logger
    // console.error(JSON.stringify(err));
    // console.error(err.stack);
    res.status(500).json({
      error: 'Unknown server side error encountered.',
    });
  }
  next();
});

app.listen(3000);
