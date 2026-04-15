const express = require("express");
const {
  httpgetAllLaunches,
  httpaddNewLaunch,
  httpAbortLaunch,
  httpGetLaunchDetails,
} = require("./launches.controller");

const launchesRouter = express.Router();

launchesRouter.get("/", httpgetAllLaunches);
launchesRouter.post("/", httpaddNewLaunch);
launchesRouter.get("/:id/details", httpGetLaunchDetails);
launchesRouter.delete("/:id", httpAbortLaunch);

module.exports = launchesRouter;
