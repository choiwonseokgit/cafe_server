const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, //빈칸 없애줌
    unique: 1, //중복방지
  },
  password: {
    type: String,
    minlength: 5,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  //registerRoute의 save로 넘어가기 전에 실행되는 함수이다. userSchema.pre()
  let user = this;

  //user의 password가 변환될때만 실행(생성도 변환이기 때문에 처음할때 함수 실행됨)
  if (user.isModified("password")) {
    //bcrypt.genSalt를 이용하여 salt를 생성
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      //위의 salt로 비밀번호를 hash(암호화)한다.
      bcrypt.hash(
        user.password,
        salt /* 위의 cb함수에서 내려온 salt */,
        function (err, hash) {
          if (err) return next(err);

          user.password = hash; //user.password 를 hash 로 교체
          next();
        }
      );
    });
  }
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
