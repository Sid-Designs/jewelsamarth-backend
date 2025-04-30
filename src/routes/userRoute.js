const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const {
  userData,
  userProfileController,
  userAddressController,
  userAddressDeleteController,
  userAddressUpdateController,
  setDefaultAddressController,
  userPaymentsController,
  userPaymentUpdateController,
  userPaymentDeleteController,
  setDefaultPaymentController,
  userProfileDataController,
} = require("../controllers/userController");

router.get("/data", userAuth, userData);
router.post("/profile-update", userProfileController);
router.post("/address-add", userAddressController);
router.put("/address-update", userAddressUpdateController);
router.delete("/address-delete", userAddressDeleteController);
router.put("/set-default-address", setDefaultAddressController);
router.post("/payments-update", userPaymentsController);
router.put("/payment-update", userPaymentUpdateController);
router.delete("/payment-delete", userPaymentDeleteController);
router.put("/set-default-payment", setDefaultPaymentController);
router.get("/profile-data/:userId", userProfileDataController);

module.exports = router;
