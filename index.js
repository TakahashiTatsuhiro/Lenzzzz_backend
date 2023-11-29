const express = require('express');
const app = express();
const userInfo = require('./items');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
app.use(express.json());

const url = process.env.DEVELOPMENT_FRONTEND_URL || process.env.PRODUCTION_FRONTEND_URL;
app.use(cors({ origin: url })); //Need confirm to Frontend
// app.use(cors({ origin: 'http://localhost:5173' })); //Need confirm to Frontend
// app.use(cors({ origin: "https://lenzzzz-frontend.onrender.com" })); //Need confirm to Frontend
// app.use(cors({ origin: 'https://lenzzzz-frontend-cgi6.onrender.com' })); //Need confirm to Frontend

//Controllre Func : Start
const userInfoFunc = async (req, res) => {
  const userId = Number(req.params.id);
  const info = await userInfo.getById(userId);
  res.status(200).send(info);
};

const registrationFunc = async (req, res) => {
  // console.log("req.body", req.body);
  const { id, user_id, purchase_date, warranty_number, warranty_unit, product_name, retailer, warranty_photo, product_photo } = req.body;

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

  res.status(201).send('追加しました');
};

const loginFunc = async (req, res) => {
  const { user_name, password } = req.body;
  // console.log("req::::::", req)
  console.log('bodyより受信', user_name, password);
  const loginId = await userInfo.getByUserPass(user_name, password);
  if (!loginId) {
    res.status(400).send('NG');
  } else {
    res.status(200).send(loginId);
  }
};
//End : Controller Func

//API : Start
app.get('/items/:id', userInfoFunc);
app.post('/registrations', registrationFunc);
app.post('/login', loginFunc);
//End : API

// AWSセット--------------------------
// const AWS = require('aws-sdk');

// v3
// import { S3Client } from '@aws-sdk/client-s3';
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

app.get('/aws3', async (req, res) => {
  try {
    console.log('AWSきてる？？？');

    const s3 = new S3Client({
      region: 'ap-southeast-2',
      credentials: {
        accessKeyId: 'AKIAZN32B6E5FSNWALN7',
        secretAccessKey: '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',
      },
    });
    // const s3 = new S3Client({ region: 'ap-southeast-2' });

    const params = {
      Bucket: 'lenzzzz',
      Key: 'bousaisyoku.jpeg',
    };

    // console.log(s3);

    const command = new GetObjectCommand(params);

    const result = await s3.send(command);

    // レスポンスに取得したオブジェクトの内容を直接送信
    // res.send(result.Body);
    console.log('result:', result);
    res.end();
  } catch (error) {
    console.error('Error getting object:', error);
    // エラーが発生した場合、エラーレスポンスを送信
    res.status(500).send('Error getting object: ' + error.message);
  }
});

// ----------------------------------

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
