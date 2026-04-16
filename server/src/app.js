const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const api = require("./routes/api");
const authRouter = require("./routes/auth/auth.router");

const app = express();

// to bypass same origin policy
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Allow cookies
  })
);

app.use(morgan("combined"));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/auth", authRouter);
app.use("/v1", api);

app.get(/^(?!\/v1).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
