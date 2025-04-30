const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const addReviewController = async (req, res) => {
  try {
    const { userId, orderId, productId, name, email, review, rating } =
      req.body;

    if (
      !userId ||
      !orderId ||
      !productId ||
      !name ||
      !email ||
      !review ||
      !rating
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const newReview = new Review({
      userId,
      orderId,
      productId,
      name,
      email,
      review,
      rating,
    });
    await newReview.save();

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

const updateReviewController = async (req, res) => {
  try {
    const { userId, orderId, productId, review, rating } = req.body;

    // Validate required fields
    if (!userId || !orderId || !productId || !review || !rating) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if the review exists and belongs to the provided orderId
    const existingReview = await Review.findOne({ userId, productId, orderId });
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found for the given user, product, and order. Please ensure the correct details.",
      });
    }

    // Update the review
    existingReview.review = review;
    existingReview.rating = rating;
    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      updatedReview: existingReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the review.",
      error: error.message,
    });
  }
};

const deleteReviewController = async (req, res) => {
  try {
    const { userId, reviewId } = req.body;

    // Validate required fields
    if (!userId || !reviewId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Review ID are required.",
      });
    }

    // Check if the user exists and fetch the admin status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if the review exists
    const existingReview = await Review.findById(reviewId); // `_id` directly matches `reviewId`
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Verify if the user is authorized to delete the review
    if (existingReview.userId.toString() !== userId && !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized access. Only the review owner or an admin can delete this review.",
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

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
  updateReviewController,
  deleteReviewController,
};
