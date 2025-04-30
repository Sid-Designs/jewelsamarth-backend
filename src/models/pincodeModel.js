const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PincodeSchema = new Schema({
  pincode: {
    type: Number,
    required: true,
  },
  days: {
    type: Number,
    required: true,
    min: [1, "Days must be at least 1"],
  },
});

module.exports = mongoose.model("Pincode", PincodeSchema);
