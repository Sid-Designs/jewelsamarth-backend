const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Customer = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Added index
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    type: String,
    unique: true,
    match: /^[0-9]{10}$/,
  },
  gender: {
    type: String,
    enum: ["Men", "Women", "Other"],
  },
  birthDate: {
    type: Date,
  },
  address: [
    {
      addressName: {
        type: String,
      },
      userAddress: {
        type: String,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
  ],
  payments: [
    {
      paymentMethod: {
        type: String,
      },
      paymentDetails: {
        type: String,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
  ],
  state: {
    type: String,
  },
  city: {
    type: String,
  },
});

module.exports = mongoose.model("Customer", Customer);
