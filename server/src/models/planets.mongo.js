const mongoose = require("mongoose");

const planetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
  ra: {
    type: Number,
  },
  dec: {
    type: Number,
  },
});

module.exports = mongoose.model("Planet", planetSchema);
