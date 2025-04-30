const express = require("express");
const router = express.Router();
const { addPincodeController, checkPincodesController } = require("../controllers/pincodeController");

router.post("/add", addPincodeController);
router.post("/check", checkPincodesController);

module.exports = router;