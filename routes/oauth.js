const router = require("express").Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URL,
});

router.get("/", (req, res) => {
  // #swagger.ignore = true

  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });

  res.redirect(authorizeUrl);
});

router.get("/callback", async (req, res) => {
  // #swagger.ignore = true

  const { code } = req.query;

  try {
    const { tokens } = await client.getToken(code);

    client.setCredentials(tokens);

    const userInfo = await client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    const token = jwt.sign(userInfo.data, process.env.SECRET);
    res.cookie("token", token);
    return res.redirect("/");
  } catch (e) {
    console.log(e);
    return res.status(400).send("Error fetching Google user info");
  }
});

module.exports = router;
