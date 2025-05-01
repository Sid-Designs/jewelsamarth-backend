const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// Add Review
const addReviewController = async (req, res) => {
  try {
    const { userId, productId, review, rating } = req.body;

    // Validate input
    if (!userId || !productId || !review || !rating) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if user and product exist
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    // Create and save review
    const newReview = new Review({ userId, productId, review, rating });
    await newReview.save();

    // Add review to product
    product.reviews.push(newReview._id);
    await product.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review: newReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the review.",
      error: error.message,
    });
  }
};

// Get All Reviews for a Product
const getAllReviewsForProductController = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate("reviews");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      reviews: product.reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching reviews.",
      error: error.message,
    });
  }
};

// Update Review
const updateReviewController = async (req, res) => {
  try {
    const { userId, productId, review, rating } = req.body;

    const existingReview = await Review.findOne({ userId, productId });
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    existingReview.review = review;
    existingReview.rating = rating;
    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review: existingReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the review.",
      error: error.message,
    });
  }
};

// Delete Review
const deleteReviewController = async (req, res) => {
  try {
    const { userId, reviewId } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this review.",
      });
    }

    await Review.findByIdAndDelete(reviewId);
    await Product.findByIdAndUpdate(review.productId, {
      $pull: { reviews: reviewId },
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the review.",
      error: error.message,
    });
  }
};

module.exports = {
  addReviewController,
  getAllReviewsForProductController,
  updateReviewController,
  deleteReviewController,
};
