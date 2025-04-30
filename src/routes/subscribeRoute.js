const express = require("express");
const router = express.Router();
const {addSubscribeController, getAllSubscribersController, getSubscribersController} = require("../controllers/subscribeController");

router.post("/add", addSubscribeController);
router.get("/all", getAllSubscribersController);
router.get("/find/:email", getSubscribersController);

module.exports = router;