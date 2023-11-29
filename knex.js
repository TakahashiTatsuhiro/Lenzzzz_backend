// import { config } from "./knexfile";
// const config = require('./knexfile');
// const environment = process.env.NODE_ENV;

// const knex = require('knex')(config);

// module.exports = knex;

const knex = require('knex');
const knexConfig = require('./knexfile');
const environment = process.env.NODE_ENV;

module.exports = knex(knexConfig[environment]);
