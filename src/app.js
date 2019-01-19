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

const types = {
  Clinic: Clinic.getMessageType(),
  Entry: Entry.getMessageType(),
  EntryAttribute: EntryAttribute.getMessageType(),
  Patient: Patient.getMessageType(),
  PatientPractitioner: PatientPractitioner.getMessageType(),
  Practitioner: Practitioner.getMessageType(),
  State: State.getMessageType(),
};

const apiReq = new Validator();

const dbDefaults = JSON.parse(fs.readFileSync(path.join(__dirname, 'db/defaults.json')));

const app = express();

const pool = new pg.Pool(dbDefaults);

const jsonParser = bodyParser.json({
  strict: true,
});

app.post('/message/', jsonParser, (req, res) => {
  let throwErr = null;
  let responseArray = [];
  try {
    /*
    1. Validate that the body is valid JSON and parse.
    If not valid, respond with 415 and the error message.
    */
    if (!req.body) {
      throwErr = {
        httpCode: 415,
        error: 'Invalid JSON request.',
      };
      throw throwErr;
    }
    /*
    2. Validate that the body adheres to the JSON Schema.
    If not valid, respond with 400 and the error message, including the list of validation errors.
    */
    const valid = apiReq.validate(req.body);

    if (!valid.success) {
      throwErr = {
        httpCode: 400,
        error: 'Unexpected message format.',
        errors: valid.errors,
      };
      throw throwErr;
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
    let clinicDbId = null;
    let firstMessage = null;
    let clinicMsg = null;
    if (Array.isArray(req.body) && req.body.length) {
      firstMessage = req.body[0];
    } else {
      throwErr = {
        httpCode: 400,
        error: 'Unexpected message format',
      };
      throw throwErr;
    }
    if (firstMessage.message_type === types.Clinic) {
      clinicMsg = firstMessage;
      clinicEmrId = firstMessage.emr_id;
    } else {
      // TODO: lookup clinic from the first clinc id found in request
      const found = false;
      if (found) {
        // set clinicid to found
      } else {
        throwErr = {
          httpCode: 400,
          error: 'A clinic_emr_id is required.',
        };
        throw throwErr;
      }
    }

    if (clinicEmrId) {
      // TODO: connect to the database for the clinic
      pool.connect((connErr, client, release) => {
        if (connErr) {
          release();
          throwErr = {
            httpCode: 500,
            error: 'Server error connecting to database.',
          };
          throw throwErr;
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
            throwErr = {
              httpCode: 500,
              error: 'transaction BEGIN failed.',
            };
            throw throwErr;
          }

          // Get row from universal.clinic where universal.clinic.emr_id = file clinic emr id.
          Clinic.selectByEmrId(client, clinicEmrId, (selErr, result) => {
            if (shouldAbort(selErr)) {
              throwErr = {
                httpCode: 500,
                error: 'Server error clinic.selectByEmrId.',
              };
              throw throwErr;
            }
            if (result) {
              clinicDbId = result.id;
              const compResult = Clinic.compare(clinicMsg, result);
              if (compResult === 'invalid') {
                throwErr = {
                  httpCode: 400,
                  error: 'Invalid Clinic Update',
                };
                throw throwErr;
              } else if (compResult === 'different') {
                clinicMsg.id = clinicDbId;
                Clinic.update(client, clinicMsg, (clinUpdErr, rowsUpdated) => {
                  // TODO: should i check if rowsUpdated !== 1 ?
                  if (shouldAbort(clinUpdErr) || rowsUpdated !== 1) {
                    throwErr = {
                      httpCode: 500,
                      error: 'Server error Clinic.update().',
                    };
                    throw throwErr;
                  }
                });
              }
            } else if (firstMessage.message_type === types.Clinic) {
              // If row does not exist, then insert it using data from message.
              Clinic.insert(client, firstMessage, (insErr, id) => {
                if (shouldAbort(insErr)) {
                  throwErr = {
                    httpCode: 500,
                    error: 'Server error clinic.selectByEmrId.',
                  };
                  throw throwErr;
                }
                clinicDbId = id;
              });
            }
            // else there was a valid clinic_emr_id but no clinic in the request

            /*
            c.Synchronize the object with the database depending on the message type.
            d.If anything fails, respond with 422.
            4. If everything succeeded, respond with 200.
            */
            for (let m = 0; m < req.body.length; m += 1) {
              const msg = req.body[m];
              switch (msg.message_type) {
                case types.Practitioner:
                  if (msg.clinic_emr_id !== clinicEmrId) {
                    throwErr = {
                      httpCode: 500,
                      error: 'Server error Clinic.update().',
                    };
                    throw throwErr;
                  }
                  break;
                case types.Patient:
                  break;
                case types.PatientPractitioner:
                  break;
                case types.Entry:
                  break;
                case types.EntryAttribute:
                  break;
                case types.State:
                  break;
                case types.Clinic:
                  // ignore if first message because we already did this
                  if (m !== 0) {
                    throwErr = {
                      httpCode: 400,
                      error: 'Only one clinic allowed per request.',
                    };
                    responseArray.push(msg);
                    throw throwErr;
                  }
                  break;
                default:
                  throwErr = {
                    httpCode: 400,
                    error: `Invalid message type: ${msg.message_type}`,
                  };
                  throw throwErr;
              }
            }

            // commit all updates
            client.query('COMMIT', (commitErr) => {
              release();
              if (shouldAbort(commitErr)) {
                throwErr = {
                  httpCode: 500,
                  error: 'COMMIT failed.',
                };
                throw throwErr;
              }
              res.status(200).json(responseArray);
            });
          });
        });
      });
    }
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
