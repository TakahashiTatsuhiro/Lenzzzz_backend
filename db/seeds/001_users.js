/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

//ダミーデータのパスワードを設定
const pw1 = "pw1";
const pw2 = "pw2";
const pw3 = "pw3";

//crypto：SHA256を含む暗号化、復号化アルゴリズムを使えるnode.jsのモジュール
const crypto = require("crypto");

//パスワードのソルトを作成
const salt1 = crypto.randomBytes(6).toString("hex");
const salt2 = crypto.randomBytes(6).toString("hex");
const salt3 = crypto.randomBytes(6).toString("hex");
console.log("🚀 ~ file: 001_users.js:16 ~ salt:", salt1);

//ソルトをパスワードに付け加える
const salt1AndPw1 = salt1 + pw1;
const salt2AndPw2 = salt2 + pw2;
const salt3AndPw3 = salt3 + pw3;

//SHA-256を使って、ハッシュ・オブジェクトを作成
const hash1 = crypto.createHash("sha256");
const hash2 = crypto.createHash("sha256");
const hash3 = crypto.createHash("sha256");

//上記で作成したハッシュ値で更新して、最後にdigest()で取り出す
const hashedPassword1 = hash1.update(salt1AndPw1).digest("hex");
const hashedPassword2 = hash2.update(salt2AndPw2).digest("hex");
const hashedPassword3 = hash3.update(salt3AndPw3).digest("hex");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").insert([
    // { id: 1, user_name: "高橋ジョージ" },
    // { id: 2, user_name: "tatsu" },
    // { id: 3, user_name: "rowValue3" },
    {
      user_name: "user1",
      pw_hash: hashedPassword1,
      pw_salt: salt1,
      user_id: 1,
    },
    {
      user_name: "user2",
      pw_hash: hashedPassword2,
      pw_salt: salt2,
      user_id: 2,
    },
    {
      user_name: "user3",
      pw_hash: hashedPassword3,
      pw_salt: salt3,
      user_id: 3,
    },
  ]);
};
