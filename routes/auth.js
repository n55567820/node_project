const router = require("express").Router();
const registerValidation = require("../validation").registerVaildation;
const loginValidation = require("../validation").loginValidation;
const passwordValidation = require("../validation").passwordValidation;
const authenticateToken = require("../middleware/requireAuth");
const User = require("../models").user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.use((req, res, next) => {
  console.log("正在接收一個關於auth有關的請求");
  next();
});

router.post("/register", async (req, res) => {
  /*  #swagger.tags = ['User']
      #swagger.description = 'Endpoint to sign up a specific user'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'User data.',
        required: true,
        schema: {
            username: "user",
            email: "user@google.com",
            password: "1234",
            role: "student or instructor"
        }
      }
  */

  // check data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // check existing
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此信箱已經被註冊過了。。。");
  // new user
  let { email, username, password, role } = req.body;
  const hashValue = await bcrypt.hash(password, 10);
  let newUser = User({ email, username, password: hashValue, role });

  try {
    await newUser.save();
    return res.json({
      message: "註冊成功"
    });
  } catch (e) {
    return res.status(500).send("無法儲存使用者....");
  }
});

router.post("/login", async (req, res) => {
  /*    #swagger.tags = ['User']
        #swagger.description = 'Endpoint to sign in a specific user'
        #swagger.parameters['body'] = {
          in: 'body',
          description: 'User data.',
          required: true,
          schema: {
              username: "user",
              password: "1234"
          }
        }
  */

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
    result = await bcrypt.compare(req.body.password, foundUser.password);
    if (result) {
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const access = jwt.sign(tokenObject, process.env.SECRET, {
        expiresIn: "30m",
      });
      const refresh = jwt.sign(tokenObject, process.env.SECRET, {
        expiresIn: "30d",
      });
      res.json({
        message: "成功登入",
        access,
        refresh,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.post("/update/password", authenticateToken, async (req, res) => {
  /*  #swagger.tags = ['User']
      #swagger.description = 'Endpoint to  update password'
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'update password',
        required: true,
        schema: {
            password: "password",
            newPassword1: "newPassword1",
            newPassword2: "newPassword2"
        }
      }
      #swagger.security = [{
            "apiKeyAuth": []
      }]
  */
  
  // check data
  const { error } = passwordValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  try {
    // ckeck password
    const foundUser = await User.findOne({ email: req.user.email });
    const result = await bcrypt.compare(req.body.password, foundUser.password);
    if (!result) {
      return res.status(401).send("密碼錯誤");
    }
    // ckeck newPassword
    if (req.body.newPassword1 !== req.body.newPassword2) {
      return res.status(401).send("新密碼不一致");
    }

    const hashValue = await bcrypt.hash(req.body.newPassword1, 10);
    let updatefoundUser = await User.findOneAndUpdate({ _id: req.user._id }, {
      password: hashValue
    }, {
      new: true,
      runValidators: true,
    });

    return res.send({
      message: "密碼更新成功"
    });

  } catch (e) {
    return res.status(500).send(e);
  }
})

router.post("/token/refresh", async (req, res) => {
  /*    #swagger.tags = ['User']
        #swagger.description = 'Endpoint to  get a new access token'
        #swagger.parameters['body'] = {
          in: 'body',
          description: 'refresh JWT token',
          required: true,
          schema: {
              refresh: "JWT token"
          }
        }
  */

  // check data
  if (!req.body.refresh) return res.status(400).send(`"refresh" is required`);

  try {
    jwt.verify(req.body.refresh, process.env.SECRET, async (err, user) => {
      if (err) {
        return res.status(403).send({
          error: "驗證錯誤 or 已過期",
        });
      }

      const tokenObject = { _id: user._id, email: user.email };
      const access = jwt.sign(tokenObject, process.env.SECRET, {
        expiresIn: "30m",
      });

      res.json({
        message: "SUCCESS",
        access,
      });
    });
  } catch (e) {
    return res.status(500).send(err);
  }
});

module.exports = router;
