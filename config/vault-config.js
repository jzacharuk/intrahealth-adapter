/**
 * This module will contain all of the configuration information for the database.
 * @module config-database
 */
module.exports = {
  // Refer to https://github.com/brianc/node-postgres
  // The connection to be used by logged in users.
  connection: {
    database: 'vault', // env var: PGDATABASE
    user: 'tally', // env var: PGUSER
    password: 'tally_pw', // env var: PGPASSWORD
    host: '192.168.99.100', // Server hosting the postgres database
    port: 54320, // env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  },
};
