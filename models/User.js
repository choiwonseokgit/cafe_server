const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

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
  } else {
    //비밀번호를 변경(생성)하지 않을때는 암호화를 굳이 해줄 필요 없으므로 바로 next()
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  //비밀번호를 비교할려면 입력된 plainPassword를 암호화 하여 DB의 password와 비교해주어야 한다.
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  //jsonwebtoken을 이용해서 token을 생성하기
  let token = jwt.sign(user._id.toHexString(), "secretToken");
  //token user에 삽입
  user.token = token;
  //user 정보 저장
  user
    .save()
    .then(() => {
      return cb(null, user);
    })
    .catch((err) => {
      return cb(err);
    });
};

userSchema.statics.findByToken = async function (token) {
  const user = this;

  try {
    const decoded = jwt.verify(token, "secretToken");
    const foundUser = await user.findOne({ _id: decoded, token: token });
    return foundUser;
  } catch (err) {
    throw err;
  }
};

// userSchema.methods.findByToken = function (token, cb) {
//   let user = this;

//   //토큰을 decode 한다.
//   jwt.verify(token, "secretToken", function (err, decoded) {
//     //유저 아이디를 이용해서 유저를 찾은 다음에
//     //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
//     user.findOne({ _id: decoded, token: token }, function (err, user) {
//       //findOne은 mongoDB 메소드이다.
//       if (err) return cb(err);
//       cb(null, user);
//     });
//   });
// };

const User = mongoose.model("User", userSchema);

module.exports = { User };
