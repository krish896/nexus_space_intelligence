const express = require("express");
const passport = require("passport");
const { httpCallback, httpRefresh, httpLogout } = require("./auth.controller");

const authRouter = express.Router();

// Initiate Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth Callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login?failed=true",
    session: false,
  }),
  httpCallback
);

// Refresh Token Endpoint
authRouter.post("/refresh", httpRefresh);

// Logout Endpoint
authRouter.post("/logout", httpLogout);

module.exports = authRouter;
