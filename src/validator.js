/* eslint-env and, mocha */
/* jshint esversion: 6 */
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, 'schemas');
let ajv = null;

/* TODO: support callbacks? */
const loadSchemas = () => {
  fs.readdir(schemaDir, (err, filenames) => {
    if (err) {
      /* callback(err); */
    } else {
      const schemaArray = [];
      filenames.forEach((filename) => {
        try {
          const schemaFile = fs.readFileSync(path.join(schemaDir, filename), 'utf-8');
          schemaArray.push(JSON.parse(schemaFile));
          // TODO: also create a list of valid schemas
        } catch (error) {
          /* callback(err); */
        }
      });

      ajv = new Ajv({
        allErrors: true,
        extendRefs: 'fail',
        verbose: true,
        schemas: schemaArray,
      });

      /* callback(); */
    }
  });
};

const validate = (json2bvalidated) => {
  const results = {};
  let validateFunction = null;
  let json2validate = json2bvalidated;
  if (typeof json2bvalidated === 'string') {
    try {
      json2validate = JSON.stringify(json2bvalidated);
    } catch (error) {
      results.success = false;
      results.errors = [error];
    }
  }
  let msgType = '';

  if (Array.isArray(json2validate)) {
    msgType = 'APIRequest.json';
  } else if (json2validate.message_type === 'Entry Attribute') {
    msgType = 'Attribute.json';
  } else {
    msgType = `${json2validate.message_type}.json`;
  }

  // TODO: verify message_type up front to be sure schema is found
  validateFunction = ajv.getSchema(msgType);
  const valid = validateFunction(json2validate);

  if (valid) {
    results.success = true;
  } else {
    results.success = false;
    results.errors = validateFunction.errors;
  }
  return results;
};

module.exports = {
  loadSchemas,
  validate,
};
