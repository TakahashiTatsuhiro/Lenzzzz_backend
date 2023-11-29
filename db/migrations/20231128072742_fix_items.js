/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("items", function (table) {
    table.renameColumn("parchase_date", "purchase_date");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("items", function (table) {
    table.renameColumn("purchase_date", "parchase_date");
  });
};
