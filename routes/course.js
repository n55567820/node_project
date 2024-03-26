const router = require("express").Router();
const Course = require("../models").course;
const courseValidtaion = require("../validation").courseVaildation;


router.get("/testAPI", (req, res) => {
    return res.send("成功連結course route...");
  });


module.exports = router;