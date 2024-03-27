const { populate } = require("../models/user-model");

const router = require("express").Router();
const User = require("../models").user;
const Course = require("../models").course;
const courseValidtaion = require("../validation").courseVaildation;


router.use((req, res, next) => {
  console.log("正在接收一個關於course有關的請求");
  next();
});

router.post("/", async (req, res) => {
    // check data
    let { error } = courseValidtaion(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const foundUser = await User.findOne({ email: req.user.email });
    if (foundUser.isStudents()) {
        return res.status(400).send("只有講師才能發佈新課程。若你已經是講師，請透過講師帳號登入。");
    }

    let { title, description, price } = req.body;
    try {
        let newCourse = new Course({
            title,
            description,
            price,
            instructor: req.user._id,
        });
        await newCourse.save();
        return res.send("新課程已經保存");
    } catch(e) {
        return res.status(500).send("無法創建課程。。。")
    }
});

// Get All course
router.get("/", async (req, res) => {
    try {
        let courseFound = await Course.find({})
            .populate("instructor", ["username, email"])
            .exec();
        return res.send(courseFound);
    } catch(e) {
        return res.status(500).send(e);
    }
});

// Get course by id
router.get("/:_id", async (req, res) => {
    let { _id } = req.params;
    try {
        let courseFound = await Course.findOne({ _id })
            .populate("instructor", ["username", "email"])
            .exec();
        return res.send(courseFound);
    } catch(e) {
        return res.status(500).send(e);
    }
});

router.patch("/:_id", async (req, res) => {
    // check data
    let { error } = courseValidtaion(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let { _id } = req.params;
    
    try {
        // check existing
        let courseFound = await Course.findOne({ _id });
        if (!courseFound) return res.status(400).send("找不到課程。無法更新課程內容。");
        
        // check course instructor
        if (courseFound.instructor.equals(req.user._id)) {
            let updateCourse = await Course.findOneAndUpdate({ _id }, req.body, {
                new: true,
                runValidators: true,
            });
            return res.send({
                message: "課程已經被更新成功",
                updateCourse
            });
        } else {
            return res.status(403).send("只有此課程的講師才能編輯課程。");
        }
    } catch(e) {
        return res.status(500).send(e);
    }
});

router.delete("/:_id", async (req, res) => {
    let { _id } = req.params;

    try {
        // check existing
        let courseFound = await Course.findOne({ _id });
        if (!courseFound) return res.status(400).send("找不到課程。無法更新課程內容。");

        // check course instructor
        if (courseFound.instructor.equals(req.user._id)) {
            await Course.deleteOne({ _id }).exec();
            return res.send({
                message: "課程已被刪除",
            });
        } else {
            return res.status(403).send("只有此課程的講師才能刪除課程。");
        }
    } catch(e) {
        return res.status(500).send(e);
    }
});


module.exports = router;
