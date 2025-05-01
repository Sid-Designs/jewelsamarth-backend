const express = require("express");
const {
  addReviewController,
  getAllReviewsForProductController,
  updateReviewController,
  deleteReviewController,
} = require("../controllers/reviewController");

const router = express.Router();

// Route to Add a Review
router.post("/add", addReviewController);

// Route to Get All Reviews for a Product
router.get("/product/:productId", getAllReviewsForProductController);

// Route to Update a Review
router.put("/update", updateReviewController);

// Route to Delete a Review
router.delete("/delete", deleteReviewController);

module.exports = router;
