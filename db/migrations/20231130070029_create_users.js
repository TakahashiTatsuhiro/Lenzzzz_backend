/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("user_name", 32).notNullable();
    table.integer("user_id", 32).unique();
    table.string("pw_hash", 128).notNullable(); //miroに参考資料を追記。確認後に実行予定
    table.string("pw_salt", 32).notNullable(); //miroに参考資料を追記。確認後に実行予定
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
