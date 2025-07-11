const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    size: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      required: [true, "Gender is required"],
    },
    regprice: {
      type: Number,
      required: [true, "Regular price is required"],
    },
    saleprice: {
      type: Number,
      required: [true, "Sale price is required"],
    },
    sku: {
      type: String,
      unique: true,
      required: [true, "SKU is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
    },
    productCategory: {
      type: String,
      required: [true, "Product Category is required"],
    },
    productTags: [
      {
        type: String,
        required: [true, "Product Tags is required"],
      },
    ],
    images: [{ type: String }],
    subImages: [{ type: String }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
