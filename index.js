const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes/auth");
const courseRoute = require("./routes/course");
const oauthRoute = require("./routes/oauth");
const authenticateToken = require("./middleware/requireAuth");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const cookieParser = require("cookie-parser");

// 連結MongoDB
mongoose
  .connect(process.env.DB_URL)
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
app.use(cookieParser());

app.use("/api/user", authRoute);
app.use("/api/courses", authenticateToken, courseRoute);
app.use("/api/oauth", oauthRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server running`);
});
