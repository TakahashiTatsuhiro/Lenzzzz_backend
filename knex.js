const knex = require("knex");
const knexConfig = require("./knexfile");
require("dotenv").config();

const environment = process.env.NODE_ENV;

module.exports = knex(knexConfig[environment]);