const router = require("express").Router();
const Course = require("../models").course;
const courseValidtaion = require("../validation").courseVaildation;


router.get("/testAPI", (req, res) => {
    return res.json({
        user: req.user,
    });
  });


module.exports = router;