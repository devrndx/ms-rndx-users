const jwt = require("jsonwebtoken");
const log = require("metalogger")();
const cryptoJs = require("crypto-js");
const admin = require("firebase-admin");

const cert = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
};

admin.initializeApp({
  credential: admin.credential.cert(cert),
});

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("Needtologin");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = admin.auth().verifyIdToken(req.header("Authorization"));
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다",
    });
  }
};

exports.adminCheck = function (req, res, next) {
  if (process.env.ADMINPW == cryptoJs.SHA256(req.body.adminPw)) {
    next();
  } else {
    return res.status(403).json({
      message: "Invaild admin certification",
    });
  }
};
