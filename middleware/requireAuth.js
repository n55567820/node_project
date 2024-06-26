const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models").user;


const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  // const token = req.cookies.Authorization;

  if (!token) {
    return res.status(401).send({
      error: "未登入",
    });
  }

  jwt.verify(token, process.env.SECRET, async (err, user) => {
    if (err) {
      return res.status(403).send({
        error: "驗證錯誤 or 已過期",
      });
    }

    const foundUser = await User.findOne({ email: user.email });
    if (!foundUser) return res.status(403).send({
        error: "驗證錯誤",
    });

    if (foundUser.verified_email === false) {
      return res.status(403).send({
        error: "信箱還未認證",
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
