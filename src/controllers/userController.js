const User = require("../models/userModel");
const Customer = require("../models/customerModel");

const userData = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found",
      });
    }
    res.json({
      success: true,
      message: "User Data Fetched Successfully",
      data: {
        username: user.username,
        verified: user.isAccountVerified,
        role: user.role,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error Occured While Fetching User Data",
      error: error.message,
    });
  }
};

const userProfileController = async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phone, gender, birthDate } =
      req.body;

    if (
      !userId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !gender ||
      !birthDate
    ) {
      return res.json({
        success: false,
        message: "All Fields are required",
      });
    }

    const customer = await Customer.findOne({ userId });

    if (customer) {
      const updatedCustomer = await Customer.findOneAndUpdate(
        { userId },
        {
          firstName,
          lastName,
          email,
          phone,
          gender,
          birthDate,
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "Profile Data Updated Successfully",
        data: updatedCustomer,
      });
    } else {
      const newCustomer = new Customer({
        userId,
        firstName,
        lastName,
        email,
        phone,
        gender,
        birthDate,
      });

      await newCustomer.save();

      res.json({
        success: true,
        message: "New Profile Created Successfully",
        data: newCustomer,
      });
    }
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occurred While Processing Profile Data",
      error: e.message,
    });
  }
};

const userAddressController = async (req, res) => {
  try {
    let { userId, addressName, userAddress } = req.body;

    if (!addressName) {
      addressName = "Others";
    }

    if (!userId || !userAddress) {
      return res.json({
        success: false,
        message: "User ID and Address Data are required",
      });
    }

    const newAddress = {
      addressName,
      userAddress,
    };

    const customer = await Customer.findOne({ userId });

    if (customer) {
      if (Array.isArray(customer.address)) {
        customer.address.push(newAddress);
        await customer.save();

        return res.json({
          success: true,
          message: "Address Added Successfully",
          data: customer,
        });
      } else if (!customer.address || customer.address.length === 0) {
        // Initialize address as an array if it doesn't exist
        customer.address = [newAddress];
        await customer.save();

        return res.json({
          success: true,
          message: "Address Added Successfully",
          data: customer,
        });
      } else {
        return res.json({
          success: false,
          message: "Invalid Address Format",
        });
      }
    } else {
      const newCustomer = new Customer({
        userId,
        address: [newAddress],
      });
      await newCustomer.save();

      return res.json({
        success: true,
        message: "New Profile Created Successfully",
        data: newCustomer,
      });
    }
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occurred While Processing Address Data",
      error: e.message,
    });
  }
};

const userPaymentsController = async (req, res) => {
  try {
    const { userId, paymentName, paymentDetails } = req.body;

    if (!userId || !paymentName || !paymentDetails) {
      return res.json({
        success: false,
        message: "User ID, Payment Name, and Payment Details are required",
      });
    }

    const newPayment = {
      paymentName,
      paymentDetails,
    };

    const customer = await Customer.findOne({ userId });

    if (customer) {
      // Manage Payments
      if (Array.isArray(customer.payments)) {
        customer.payments.push(newPayment);
      } else {
        customer.payments = [newPayment];
      }

      await customer.save();

      return res.json({
        success: true,
        message: "Payment Details Added Successfully",
        data: customer,
      });
    } else {
      // Create a new Customer with payment details
      const newCustomer = new Customer({
        userId,
        payments: [newPayment],
      });
      await newCustomer.save();

      return res.json({
        success: true,
        message: "New Profile Created Successfully with Payment Details",
        data: newCustomer,
      });
    }
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occurred While Processing Payment Details",
      error: e.message,
    });
  }
};

const userProfileDataController = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await Customer.findOne({ userId });
    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found",
      });
    }
    res.json({
      success: true,
      message: "User Data Fetched Successfully",
      data: {
        user
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error Occured While Fetching User Data",
      error: error.message,
    });
  }
};

module.exports = {
  userData,
  userProfileController,
  userAddressController,
  userPaymentsController,
  userProfileDataController,
};
