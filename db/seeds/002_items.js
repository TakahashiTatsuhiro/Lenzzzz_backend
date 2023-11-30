/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("items").insert([
    {
      user_id: 1,
      purchase_date: "2015-05-05",
      warranty_number: 2,
      warranty_unit: "year",
      product_name: "メガネ",
      retailer: "JINS",
      warranty_photo: "dummy",
      product_photo: "dummy2",
    },
    {
      user_id: 2,
      purchase_date: "2015-06-05",
      warranty_number: 1,
      warranty_unit: "year",
      product_name: "子供用メガネ",
      retailer: "JINS",
      warranty_photo: "dummy",
      product_photo: "dummy2",
    },
    {
      user_id: 3,
      purchase_date: "2015-07-05",
      warranty_number: 6,
      warranty_unit: "month",
      product_name: "交換レンズ",
      retailer: "JINS",
      warranty_photo: "dummy",
      product_photo: "dummy2",
    },
  ]);
};
