const express = require("express");
const bodyParser = require("body-parser"); // body-parserをインポート
const app = express();
const userInfo = require("./items");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const knex = require("./knex");
const crypto = require("crypto");

// app.use(express.json());

// 受信容量制限を変更
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ message: err.message }); // あるいはカスタマイズされたエラーメッセージ
  }
  next();
});

const url =
  process.env.DEVELOPMENT_FRONTEND_URL || process.env.PRODUCTION_FRONTEND_URL;
// app.use(cors({ origin: url })); //Need confirm to Frontend
app.use(cors({ origin: "http://localhost:5173" })); //Need confirm to Frontend
// app.use(cors({ origin: "https://lenzzzz-frontend.onrender.com" })); //Need confirm to Frontend
// app.use(cors({ origin: 'https://lenzzzz-frontend-cgi6.onrender.com' })); //Need confirm to Frontend

//Controllre Func : Start
const getAllItems = async (req, res) => {
  const _userId = Number(req.params.userId);
  const info = await userInfo.getById(_userId);
  res.status(200).send(info);
};

const getSingleItems = async (req, res) => {
  const _userId = Number(req.params.userId);
  const info = await userInfo.getById(_userId);
  res.status(200).send(info[req.params.index]);
};

const registrationFunc = async (req, res) => {
  // console.log("req.body", req.body);
  const {
    id,
    user_id,
    purchase_date,
    warranty_number,
    warranty_unit,
    product_name,
    retailer,
    warranty_photo,
    product_photo,
  } = req.body;

  const appDate = await userInfo.save({
    id,
    user_id,
    purchase_date,
    warranty_number,
    warranty_unit,
    product_name,
    retailer,
    warranty_photo,
    product_photo,
  });

  res.status(201).send("追加しました");
};

// const loginFunc = async (req, res) => {
//   const { user_name, password } = req.body;
//   // console.log("req::::::", req)
//   // console.log('bodyより受信', user_name, password);
//   const loginId = await userInfo.getByUserPass(user_name, password);
//   if (!loginId) {
//     res.status(400).send("NG");
//   } else {
//     res.status(200).send(loginId);
//   }
// };
//End : Controller Func

// hash作成用関数
const makeHash = (password, salt) => {
  const saltAndPw = salt + password;
  const hash = crypto.createHash("sha256");
  const hashedPassword = hash.update(saltAndPw).digest("hex");

  return hashedPassword;
};

//API : Start
app.get("/:userId/items", getAllItems);
app.get("/:userId/items/:index", getSingleItems);
// app.get('/items/:id', userInfoFunc);
app.post("/registrations", registrationFunc);

//ログイン認証対応
app.post("/login", async (req, res) => {
  console.log("ログインpost受け取り-------------------");
  //フロントフォームから届いたユーザーネームとパスワードを取得
  const userName = req.body[0].user_name;
  const password = req.body[0].password;

  let result;
  await knex("users")
    .where({ user_name: userName })
    .select()
    .then((data) => {
      result = data;
    });

  //ユーザーネームが無いケース
  if (!result.length) {
    res.status(400).send("ユーザーIDまたはパスワードが一致してません");
  } else {
    //ユーザーネーム合致ケース
    ////DBにあるソルトとハッシュを取得
    const salt = result[0].pw_salt;
    const hash = result[0].pw_hash;
    ////ユーザーがインプットしたパスワードとDBのソルトを合わせて、ハッシュ化されたパスワードを作成
    const inputHashedPw = makeHash(password, salt);
    ////DBにあるハッシュ化されたパスワードと、inputHashedPwを比較
    if (hash === inputHashedPw) {
      const loginId = await userInfo.getByUserPass(userName, hash);
      const id = JSON.stringify(result[0].user_id);
      console.log("🚀 ~ file: index.js:126 ~ app.post ~ id:", id);
      res.status(200).send(loginId);
    } else {
      res.status(400).send("ユーザーIDまたはパスワードが一致してません");
    }
  }
});

//新規ユーザー登録対応
app.post("/users/new", async (req, res) => {
  const userName = req.body.user_name;
  const pw = req.body.password;

  //ユーザーネームが既存のものとかぶってないかをチェック
  let checkUniqueName;
  await knex("users")
    .where({ user_name: userName })
    .select()
    .then((data) => {
      checkUniqueName = data;
    });

  if (!checkUniqueName.length) {
    res.status(404).send("ユーザーネームを変えてください");
  }

  //新規登録するuser_idを既存のuser_idの最大から決定する
  let newId;
  await knex("users")
    .max("user_id as maxId")
    .then(([result]) => {
      newId = result.maxId + 1;
      return;
    });

  //パスワードのソルトを作成
  const salt = crypto.randomBytes(6).toString("hex");
  //ソルトをパスワードに付け加える
  const saltAndPw = salt + pw;
  //SHA-256を使って、ハッシュ・オブジェクトを作成
  const hash = crypto.createHash("sha256");
  //上記で作成したハッシュ値で更新して、最後にdigest()で取り出す
  const hashedPassword = hash.update(saltAndPw).digest("hex");

  //新規ユーザーをusersテーブルに登録する
  await knex("users").insert({
    user_name: userName,
    user_id: newId,
    pw_hash: hashedPassword,
    pw_salt: salt,
  });

  //フロントに返すためにidを文字列化
  const idToFront = JSON.stringify(newId);
  res.status(200).send(idToFront);
});
//End : API

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
