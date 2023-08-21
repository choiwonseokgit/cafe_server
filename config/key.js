if (process.env.NODE_ENV === "production") {
  module.exports = require("./prod");
} else {
  module.exports = require("./dev");
} //개발할때 배포할때 케이스 나누는 것
