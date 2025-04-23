const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Order = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    products: {
      type: Array,
      required: true,
    },
    totalAmt: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: false,
    },
    finalAmt: {
      type: Number,
      required: true,
    },
    paymentMethod:{
      type: String,
      required: true,
    },
    paymentStatus:{
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    payment_id:{
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    orderNumber:{
      type: String,
      required: false,
      unique: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", Order);
