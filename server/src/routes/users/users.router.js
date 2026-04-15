const express = require("express");
const { httpGetProfile } = require("./users.controller");

const usersRouter = express.Router();

usersRouter.get("/me", httpGetProfile);

module.exports = usersRouter;
