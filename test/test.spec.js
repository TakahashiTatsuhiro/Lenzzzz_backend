const { expect, assert } = require("chai");
const config = require("../knexfile");
const knex = require("knex")(config);

// {
//     "id" : "4",
//     "user_id" : "2",
//     "purchase_date" : "2023-11-28",
//     "warranty_number":"2",
//     "warranty_unit": "year",
//     "product_name" : "sunglass",
//     "retailer" : "ray-ban",
//     "warranty_photo": "dummy",
//     "product_photo" : "dummy2"
//     }
