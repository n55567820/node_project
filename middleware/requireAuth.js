const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models").user;


const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).send({
      error: "未登入",
    });
  }

  jwt.verify(token, process.env.SECRET, async (err, user) => {
    if (err) {
      return res.status(403).send({
        error: "驗證錯誤",
      });
    }

    const foundUser = await User.findOne({ email: user.email });
    if (!foundUser) return res.status(403).send({
        error: "驗證錯誤",
    });

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
