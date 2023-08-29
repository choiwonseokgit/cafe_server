const express = require("express");
const app = express();
const port = 5000;
const config = require("./config/key");
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//application/x-www-form-urlencoded 의 형태의 데이터를 서버에서 분석해서 가져올수 있게 해줌 이거 있어야 데이터 구분 가능
app.use(bodyParser.urlencoded({ extended: true }));
//application/json 의 형태의 데이터를 서버에서 분석해서 가져올수 있게 해줌 이거 있어야 데이터 구분 가능
app.use(bodyParser.json());
app.use(cookieParser());

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

app.post("/api/users/login", (req, res) => {
  //로그인할때 입력된 이메일을 DB에 있는지 찾는다.
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          messsage: "제공된 이메일에 해당하는 유저가 없습니다.",
        });
      }

      //이메일이 DB에 있다면 비밀번호가 맞는 비밀번호 인지 찾는다.
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) {
          return res.json({
            loginSuccess: false,
            message: "비밀번호가 틀렸습니다.",
          });
        }
        //비밀번호가 맞다면 토큰을 생성한다.
        user.generateToken((err, user) => {
          //에러있으면 에러메세지 출력
          if (err) return res.status(400).send(err);
          //토큰을 저장한다. 쿠키에다가
          res
            .cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      });
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
});

app.get("/api/users/auth", auth, async (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True 라는 말.
  try {
    res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image,
    });
  } catch (err) {
    throw err;
  }
});

app.get("/api/users/logout", auth, async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { token: "" }
    );

    if (!updatedUser) {
      return res.json({ success: false });
    }

    return res.status(200).send({
      success: true,
    });
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
