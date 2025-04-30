const Pincode = require("../models/pincodeModel");

const addPincodeController = async (req, res) => {
  try {
    const { pincode, days } = req.body;

    if (!pincode || !days) {
      return res.status(400).json({
        success: false,
        message: "Missing required details: pincode or days",
      });
    }

    const existingPincode = await Pincode.findOne({ pincode: pincode.trim() });

    if (existingPincode) {
      return res.status(409).json({
        success: false,
        message: "Pincode already exists",
      });
    }

    const newPincode = new Pincode({ pincode: pincode.trim(), days });
    await newPincode.save();

    return res.status(201).json({
      success: true,
      message: "Pincode added successfully",
    });
  } catch (error) {
    console.error("Error while adding pincode:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the pincode",
      error: error.message,
    });
  }
};

const checkPincodesController = async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required",
      });
    }

    const trimmedPincode = pincode.trim();

    const pincodeData = await Pincode.findOne({ pincode: trimmedPincode });

    if (!pincodeData) {
      return res.json({
        success: false,
        message: "Pincode not found",
        requestedPincode: pincodeData,
      });
    }

    return res.json({
      success: true,
      message: "Pincode found",
      data: pincodeData,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "An internal error occurred",
      error: error.message,
    });
  }
};

module.exports = { addPincodeController, checkPincodesController };
