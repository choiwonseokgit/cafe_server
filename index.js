const express = require("express");
const app = express();
const port = 5000;
const config = require("./config/key");

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
