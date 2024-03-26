const router = require("express").Router();
const registerValidation = require("../validation").registerVaildation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.use((req, res, next) => {
  console.log("正在接收一個關於auth有關的請求");
  next();
});

// router.get("/testAPI", (req, res) => {
//   return res.send("成功連結auth route...");
// });

router.post("/register", async (req, res) => {
  // check data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // check existing
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此信箱已經被註冊過了。。。");
  // new user
  let { email, username, password, role } = req.body;
  let newUser = User({ email, username, password, role });

  try {
    let savedUser = await newUser.save();
    return res.send({
      message: "使用者成功儲存。",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("無法儲存使用者....");
  }
});

router.post("/login", async (req, res) => {
  // check data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // check existing
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(400).send("無法找到使用者");
  }

  let result;
  try {
    result = bcrypt.compare(req.body.password, foundUser.password);
    if (result) {
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.SECRET);
      res.send({
        message: "成功登入",
        token: token,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  } catch (e) {
    return res.status(500).send(err);
  }
});

module.exports = router;
