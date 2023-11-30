/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("items", function (table) {
    table.increments("id").primary();
    table.integer("user_id").references("users.user_id");
    table.date("purchase_date").notNullable();
    table.integer("warranty_number");
    table.string("warranty_unit", 32);
    table.string("product_name", 32);
    table.string("retailer", 32);
    table.text("warranty_photo");
    table.text("product_photo");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("items");
};
