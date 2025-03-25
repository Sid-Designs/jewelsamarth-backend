const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const {userData, userProfileController, userAddressController, userPaymentsController, userProfileDataController} = require("../controllers/userController");

router.get("/data", userAuth, userData);
router.post("/profile-update", userProfileController);
router.post("/address-update", userAddressController);
router.post("/payments-update", userPaymentsController);
router.get("/profile-data", userProfileDataController);

module.exports = router;
