/* eslint-env  */
/* jshint esversion: 6 */
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('./validator');

const app = express();

validator.loadSchemas();

// create application/json parser
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
  }

  /*
  2. Validate that the body adheres to the JSON Schema.
  If not valid, respond with 400 and the error message, including the list of validation errors.
  3. Process each message within the body, one at a time.
  a.Parse the clinic id(emr_id) out of the first message(message_type = “Clinic”).
  b.Create a database connection based on the clinic id or use a cached one
  if it exists.
  c.Synchronize the object with the database depending on the message type.
  d.If anything fails, respond with 422.
  4. If everything succeeded, respond with 200.
  */
  res.json({
    status: 'success',
  });
});

app.listen(3000);
