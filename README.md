# Lenzzzz とは

皆さん、保証書ちゃんと管理できていますか？

1 年保証や 3 年保証のものだったり、

家電の長期保証で 7 年の物があったりすると思います。

いざ使いたいときに、「あれ？保証書どこだ？」となる人はきっと多いハズ。

アプリで管理できたら良いと思いませんか？

そんなアプリ。開発中です。

## デプロイ先 URL

このアプリは、フロントエンドとバックエンドのデプロイ先が存在します。

render でデプロイしている関係上、アプリをしばらく起動していないとサーバーが落ちてしまうため、

まず、バックエンド側のデプロイ先を開いてください。

`https://lenzzzz.onrender.com`

画面上に、`Cannot GET /`が表示されたらサーバーが立ち上がります。

続いて、フロントエンド側の、

`https://lenzzzz-front.onrender.com/`二アクセスしてアプリをお楽しみください。

現在、新規登録ユーザーの設定が追加できない仕様のため、
/db/seeds 内に格納されているファイルから記入するべき内容を読み解いてください。

参考資料(miro リンク)

`https://miro.com/welcomeonboard/Rm9TbTJidFhkWXNDeElQbUYxbkZkbVRrQU9WeDRaREdpbHQ0ZnpCVW5iaFoxZ1g5b1pwWEFFRFVLdmN5M0dlT3wzNDU4NzY0NTcxMTQwMTcwMDQzfDI=?share_link_id=95512790893`

## 初期セットアップ手順

このアプリは、フロントエンド側のファイルとバックエンド側のファイルがそれぞれの Repository に分かれています。

こちらの Repository は、バックエンド側になります。

〜バックエンド側のセットアップ手順〜

1. 開発環境の場合、postgresql などの DB を作成
2. ルート直下に`.env`ファイルの作成
3. 2 で作成した DB と接続するために`.env`ファイル下記内容を記述
   1. DB_NAME=[**あなたの環境に合わせてください**]
   2. DB_USER=[**あなたの環境に合わせてください**]
   3. DB_PASSWORD=[**あなたの環境に合わせてください**]
   4. NODE_ENV=development
   5. DEVELOPMENT_FRONTEND_URL=[http://localhost:5173/など]
4. `npm run build`を実行(マイグレーション、シーディングまで完了します)
5. `npm run dev`を行うことで nodemon を用いてサーバーが立ち上がります。

〜フロントエンドのセットアップ手順〜

1. `https://github.com/TakahashiTatsuhiro/Lenzzzz_frontend`にアクセスしてください
2. 上記 Repository を`git clone ~~`してください
3. `cd Lenzzzz_frontend`
4. ルート直下に`.env`ファイルを作成してください
5. `VITE_DEVELOPMENT_BACKEND_URL=http://localhost:3000など`のように、バックエンド側のサーバーのリンク先を記述してください
6. `npm i`
7. `npm run dev`

で、Vite のサーバーが立ち上がります。

初期設定のままであれば、`http://localhost:5173/`にアクセスしていただき、

アプリをお楽しみください。

## デプロイに向けて

フロントエンドとバックエンドのレポジトリを分割している都合上、

Render 等でデプロイする場合は、

- フロントエンド用の静的ファイルのサイト
- バックエンド用のアプリケーション用サイト
- DB

の 3 種類必要になります。

環境変数はそれぞれ、

フロントエンド

- `VITE_PRODUCTION_BACKEND_URL: https://バックエンドのurl.com`
- .env file 内に、`VITE_REACT_APP_BACKEND_URL=https:/バックエンドのurl.com`

バックエンド

- `DATABASE_URL: https://フロントエンドのurl.com`
- `NODE_ENV: production`
- `PRODUCTION_FRONTEND_URL: https://フロントエンドのurl.com`

をそれぞれ記入してください。

## 画面遷移イメージ

- login 画面
- user 毎のメイン画面(登録しているアイテムが表示される)
  - 登録したアイテムの情報詳細画面
- 入力画面と登録ボタン(POST メソッド)
- (いつの日かきっと実装)期限切れ前昇順リスト

~画面遷移のイメージ~

```mermaid
graph TD

0[login画面]-->|認証|1[mainページ]-->|ボタン押下|2[入力画面]-->1-->|戻る|0
1-->|サムネイル押下|3[詳細情報画面]-->|戻る|1
1-.->|未実装|4[期限切れ前リスト]-.->|未実装|1


```

## ER 図

user 管理を行う users テーブルと、各 user が登録したアイテムの情報を格納する items テーブルを使用します。

```mermaid
erDiagram

users ||--o{ items: "user_id同士の紐付け"

users {
  increments id PK
  string(32) user_name "notNull"
  integer(32) user_id "unique"
  string(128) pw_hash "notNull"
  string(32) pw_salt "notNull"
}

items {
  increments id PK
  integer user_id
  date purchase_date "notNull"
  integer warranty_number
  string warranty_unit
  string(32) retailer
  text warranty_photo
  text product_photo
}

```

## シーケンス図

データの挙動について簡単に作図する

```mermaid
sequenceDiagram

participant A as Client
participant B as Server
participant C as Database

Note left of A:ログイン認証
A->>+B: POST(user_name, password)
B->>+C: データベース問い合わせ
C-->>-B: res(user_name, pw_salt, pw_hash)
B-->>-A: 認証結果

Note left of A:保証書登録
A->>+B: POST(各種登録情報)
B->>+C: データベースへ保存
C-->>-B: 保存完了
B-->>-A: 保存完了ステータス

Note left of A:リスト詳細表示
A->>+B: GET(index)
B->>+C: データベース問い合わせ
C-->>-B: user単位の全情報送信
Note over B:商品フィルタリング
B-->>-A: 商品単体の情報

```

## 機能作成優先順位

- [x] 1. サムネイル押下による商品詳細ページ遷移
- [ ] 2. passportjs によるログイン認証の実装
- [ ] 3. 期限リストの表示
- [ ] 4. CSS などの装飾
