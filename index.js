const express = require("express");
const bodyParser = require("body-parser"); // body-parserをインポート
const app = express();
const userInfo = require("./items");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const knex = require("./knex");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
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
app.use(cors({ origin: "http://localhost:5173", credentials: true })); //Need confirm to Frontend

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 本番環境ではHTTPSを使用する
      maxAge: 24 * 60 * 60 * 1000, // クッキーの有効期限（例：24時間）
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Controller Func : Start
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
//End : Controller Func

// hash作成用関数
const makeHash = (password, salt) => {
  const saltAndPw = salt + password;
  const hash = crypto.createHash("sha256");
  const hashedPassword = hash.update(saltAndPw).digest("hex");

  return hashedPassword;
};

const selectedUserByName = async (userName) => {
  return await knex("users")
    .where({ user_name: userName })
    .select()
    .then((data) => data);
};

const selectedUserById = async (id) => {
  return await knex("users")
    .where({ id: id })
    .select()
    .then((data) => data);
};

const verifyPassword = async (userName, password) => {
  const userData = await selectedUserByName(userName);
  const salt = userData[0].pw_salt;
  const dbHashedPW = userData[0].pw_hash;
  const hashedPassword = makeHash(password, salt);
  return [dbHashedPW === hashedPassword, [{ id: userData[0].id }]];
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "user_name",
      passwordField: "password",
    },
    async (userName, password, done) => {
      try {
        const userData = await selectedUserByName(userName);
        if (!userData || userData.length === 0) {
          return done(null, false, {
            message: "ユーザー名またはパスワードが異なります",
          });
        }
        const [isAuth, idArray] = await verifyPassword(userName, password);
        if (isAuth) {
          return done(null, userData[0]);
        } else {
          return done(null, false, {
            message: "ユーザー名またはパスワードが異なります",
          });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await selectedUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ログイン用のエンドポイント
app.post("/login", (req, res, next) => {
  // req.body = [{user_name: xxx, password: xxx}]の形式なので、
  // objectだけに抜き出してreq.bodyに上書きする
  const firstElem = req.body[0];
  req.body = firstElem;
  // console.log("req.body: ", req.body);
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ message: "Login failed" });
      }
      const idArray = [{ id: user.id }];
      return res.status(200).send(idArray);
      // return res.status(200).json({ message: "Login successful" });
    });
  })(req, res, next);
});

app.get("/", (req, res) => {
  // console.log("req.isAuthenticated()", req.isAuthenticated());
  // console.log(req.user);
  if (req.isAuthenticated() && req.user) {
    res.status(200).json([{ id: req.user[0].id }]);
  } else {
    // res.status(200).json([{ id: null }]);
    // console.log("cokkieないよ。リダイレクトしてね。");
    res.redirect("/login");
  }
});

//API : Start
app.get("/:userId/items", getAllItems);
app.get("/:userId/items/:index", getSingleItems);
app.post("/registrations", registrationFunc);

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

  if (checkUniqueName.length) {
    res.status(404).send("ユーザーネームを変えてください");
  } else {
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
  }
});
//End : API

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
