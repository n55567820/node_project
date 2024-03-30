const router = require("express").Router();
const { google } = require("googleapis");
const request = require("request");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const defaultScope = [
  "https://www.googleapis.com/auth/plus.me",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

router.get("/", (req, res) => {
  // #swagger.ignore = true

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: defaultScope,
  });

  res.redirect(authorizationUrl);
});

router.get("/callback", async (req, res) => {
  // #swagger.ignore = true

  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  request(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokens.id_token}`,
    { json: true },
    (err, res, body) => {
      console.log(body);
    }
  );

  return res.send("working");
});

module.exports = router;
