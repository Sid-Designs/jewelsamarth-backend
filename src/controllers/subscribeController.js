const Subscribe = require("../models/subscribeModel");

const addSubscribeController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    const existingSubscriber = await Subscribe.findOne({ email: email.trim() });

    if (existingSubscriber) {
      return res.json({
        success: false,
        message: "Email is already subscribed",
      });
    }

    const newSubscriber = new Subscribe({ email: email.trim() });
    await newSubscriber.save();

    return res.json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    console.error("Error while adding subscriber:", error.message);
    return res.json({
      success: false,
      message: "An error occurred while adding the subscriber",
      error: error.message,
    });
  }
};

const getAllSubscribersController = async (req, res) => {
  try {
    const { email } = req.params;

    if (email) {
      const subscriber = await Subscribe.findOne({ email: email.trim() });

      if (subscriber) {
        return res.json({
          success: true,
          message: "Subscriber found",
          subscriber,
        });
      } else {
        return res.json({
          success: false,
          message: "Subscriber not found",
        });
      }
    }

    const subscribers = await Subscribe.find({});

    if (subscribers.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Subscribers found",
        subscribers,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No subscribers found",
      });
    }
  } catch (error) {
    console.error("Error while fetching subscribers:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching subscribers",
      error: error.message,
    });
  }
};

const getSubscribersController = async (req, res) => {
  try {
    const { email } = req.params;

    if (email) {
      const subscriber = await Subscribe.findOne({ email: email.trim() });

      if (!subscriber) {
        return res.status(404).json({
          success: false,
          message: "Subscriber not found.",
          requestedEmail: email,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Subscriber found.",
        data: subscriber,
      });
    }

    const subscribers = await Subscribe.find({});

    if (subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subscribers found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscribers found.",
      data: subscribers,
    });
  } catch (error) {
    console.error("Error while fetching subscribers:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching subscribers.",
      error: error.message,
    });
  }
};

module.exports = {
  addSubscribeController,
  getAllSubscribersController,
  getSubscribersController,
};
