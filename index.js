const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const authenticateToken = require("./middleware/requireAuth");
const cors = require("cors");
const port = 8080;

// 連結MongoDB
mongoose
  .connect("mongodb://mongo_db:27017/mernDB")
  .then(() => {
    console.log("DB Connected");
  })
  .catch((e) => {
    console.log(e);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoute);
app.use("/api/courses", authenticateToken, courseRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
