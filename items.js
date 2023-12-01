const knex = require("./knex");

const getById = (id) => {
  return (
    knex("items")
      // .join("items", "users.id", "=", "items.user_id")
      .select({
        id: "id",
        user_id: "user_id",
        purchase_date: "items.purchase_date",
        warranty_number: "items.warranty_number",
        warranty_unit: "items.warranty_unit",
        product_name: "items.product_name",
        retailer: "items.retailer",
        warranty_photo: "items.warranty_photo",
        product_photo: "items.product_photo",
      })
      .where({
        user_id: id,
      })
  );
};

const save = (data) => {
  return knex("items").insert(data);
};

const getByUserPass = (user_name, hashedPassword) => {
  return knex("users")
    .select({
      id: "id",
    })
    .where({
      user_name: user_name,
      pw_hash: hashedPassword,
    });
};

module.exports = { getById, save, getByUserPass };
