const mongoose = require("mongoose");

const launchDetailsSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  mission: {
    type: String,
    required: true,
  },
  wikipediaSummary: {
    type: String,
    default: "",
  },
  outcomes: {
    type: String,
    default: "",
  },
  timeline: [{
    time: Number,
    reason: String,
  }],
  personnel: [String],
});

module.exports = mongoose.model("LaunchDetail", launchDetailsSchema);
