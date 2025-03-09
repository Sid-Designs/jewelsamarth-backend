const express = require("express");
const router = express.Router();
const checkAdmin = require("../middlewares/checkAdmin");
const {addtocartController, getcartController, allcartController} = require("../controllers/cartController");

router.post("/add", addtocartController);
router.post("/get", getcartController);  
router.get("/getall",checkAdmin , allcartController);

module.exports = router;
