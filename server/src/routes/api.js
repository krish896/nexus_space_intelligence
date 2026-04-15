const express = require("express");
const { verifyToken } = require("../services/auth");

const planetsRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");
const usersRouter = require("./users/users.router");

const api = express.Router();

// Apply auth middleware to protect all routes under /v1
api.use(verifyToken);

api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);
api.use("/users", usersRouter);

module.exports = api;

// in this file we are now abstraacting all our routes from our main app.js file and just leaving app to append versioning and middlewares
