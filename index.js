const express = require("express");
const app = express();
const port = 5000;
const config = require("./config/key");
const { User } = require("./models/User");
const bodyParser = require("body-parser");

//application/x-www-form-urlencoded 의 형태의 데이터를 서버에서 분석해서 가져올수 있게 해줌 이거 있어야 데이터 구분 가능
app.use(bodyParser.urlencoded({ extended: true }));
//application/json 의 형태의 데이터를 서버에서 분석해서 가져올수 있게 해줌 이거 있어야 데이터 구분 가능
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("몽고DB 연결완료!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! 원석's의 카페이다.");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      return res.json({ success: false, err });
    });
});
