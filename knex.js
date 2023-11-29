// import { config } from "./knexfile";
const config = require("./knexfile");
const knex = require("knex")(config);
// import { knex } from "knex";
// require("dotenv").config();
// const knexConfig = knex(config);

module.exports = knex;
