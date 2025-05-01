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

    // Check for required fields
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

    // Format birthDate as a Date object
    const formattedBirthDate = new Date(birthDate);

    // Check if customer exists
    const customer = await Customer.findOne({ userId });

    if (customer) {
      // Update existing customer
      const updatedCustomer = await Customer.findOneAndUpdate(
        { userId },
        {
          firstName,
          lastName,
          email,
          phone,
          gender,
          birthDate: formattedBirthDate, // Properly formatted date
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Profile Data Updated Successfully",
        data: updatedCustomer,
      });
    } else {
      // Create a new customer
      const newCustomer = new Customer({
        userId,
        firstName,
        lastName,
        email,
        phone,
        gender,
        birthDate: formattedBirthDate, // Properly formatted date
      });

      await newCustomer.save();

      return res.json({
        success: true,
        message: "New Profile Created Successfully",
        data: newCustomer,
      });
    }
  } catch (e) {
    console.error("Error processing profile data:", e.message); // Log the error
    return res.json({
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

const userAddressDeleteController = async (req, res) => {
  try {
    const { userId, addressId, addressName } = req.body;

    if (!userId || !addressId || !addressName) {
      return res.status(400).json({
        success: false,
        message: "User ID, Address ID (_id), and Address Name are required",
      });
    }

    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const addressToDelete = customer.address.find(
      (address) =>
        address._id.toString() === addressId &&
        address.addressName === addressName
    );

    if (!addressToDelete) {
      return res.status(403).json({
        success: false,
        message: "Address not found or does not belong to the user",
      });
    }

    customer.address = customer.address.filter(
      (address) => address._id.toString() !== addressId
    );

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the address",
      error: error.message,
    });
  }
};

const userAddressUpdateController = async (req, res) => {
  try {
    const { userId, addressId, userAddress } = req.body;

    if (!userId || !addressId || !userAddress) {
      return res.status(400).json({
        success: false,
        message: "User ID, Address ID (_id), and User Address are required",
      });
    }

    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const addressToUpdate = customer.address.find(
      (address) => address._id.toString() === addressId
    );

    if (!addressToUpdate) {
      return res.status(403).json({
        success: false,
        message: "Address not found or does not belong to the user",
      });
    }

    addressToUpdate.userAddress = userAddress;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the address",
      error: error.message,
    });
  }
};

const setDefaultAddressController = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Address ID are required",
      });
    }

    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    customer.address.forEach((address) => {
      address.isDefault = address._id.toString() === addressId;
    });

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the default address",
      error: error.message,
    });
  }
};

const userPaymentsController = async (req, res) => {
  try {
    const { userId, paymentMethod, paymentDetails } = req.body;

    if (!userId || !paymentMethod || !paymentDetails) {
      return res.json({
        success: false,
        message: "User ID, Payment Name, and Payment Details are required",
      });
    }

    const newPayment = {
      paymentMethod,
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

const userPaymentUpdateController = async (req, res) => {
  try {
    const { userId, paymentId, paymentMethod, paymentDetails } = req.body;

    // Validate required input
    if (!userId || !paymentId || (!paymentMethod && !paymentDetails)) {
      return res.status(400).json({
        success: false,
        message:
          "User ID, Payment ID, and at least one update field (Payment Method or Details) are required",
      });
    }

    // Find user by userId
    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the payment to update
    const paymentToUpdate = customer.payments.find(
      (payment) => payment._id.toString() === paymentId
    );

    if (!paymentToUpdate) {
      return res.status(403).json({
        success: false,
        message: "Payment not found or does not belong to the user",
      });
    }

    // Update only the provided fields
    if (paymentMethod) paymentToUpdate.paymentMethod = paymentMethod;
    if (paymentDetails) paymentToUpdate.paymentDetails = paymentDetails;

    // Save updated customer record
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment details updated successfully",
      data: customer,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error updating payment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the payment",
      error: error.message,
    });
  }
};

const userPaymentDeleteController = async (req, res) => {
  try {
    const { userId, paymentId } = req.body;

    // Validate required input
    if (!userId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Payment ID are required",
      });
    }

    // Find user by userId
    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find and remove the payment
    const paymentToDelete = customer.payments.find(
      (payment) => payment._id.toString() === paymentId
    );

    if (!paymentToDelete) {
      return res.status(403).json({
        success: false,
        message: "Payment not found or does not belong to the user",
      });
    }

    // Filter out the payment
    customer.payments = customer.payments.filter(
      (payment) => payment._id.toString() !== paymentId
    );

    // Save updated customer record
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      data: customer,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error deleting payment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the payment",
      error: error.message,
    });
  }
};

const setDefaultPaymentController = async (req, res) => {
  try {
    const { userId, paymentId } = req.body;

    if (!userId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Payment ID are required",
      });
    }

    const customer = await Customer.findOne({ userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    customer.payments.forEach((payment) => {
      payment.isDefault = payment._id.toString() === paymentId;
    });

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Default payment method updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the default payment method",
      error: error.message,
    });
  }
};

const userProfileDataController = async (req, res) => {
  const { userId } = req.params;
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
        user,
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

const userDetailsController = async (req, res) => {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId);
    res.json({
      success: true,
      message: "User Found",
      name: user.username
    })
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
  userAddressUpdateController,
  userAddressDeleteController,
  setDefaultAddressController,
  userPaymentsController,
  userPaymentUpdateController,
  userPaymentDeleteController,
  setDefaultPaymentController,
  userProfileDataController,
  userDetailsController,
};
