const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  target: {
    type: String,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    default: null,  // null = unknown (future launches from LL2)
  },
  // Multi-agency fields
  agency: {
    type: String,
    default: "SpaceX",
  },
  launchPad: {
    type: String,
  },
  sourceId: {
    // LL2 UUID or SpaceX ID — prevents duplicate upserts
    type: String,
    unique: false,
  },
});

module.exports = mongoose.model("Launch", launchesSchema);

// creates a Launch model and links it to the launches collection in MongoDB.

