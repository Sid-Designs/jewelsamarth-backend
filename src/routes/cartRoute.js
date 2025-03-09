const express = require("express");
const router = express.Router();
const {addtocartController, getcartController, allcartController} = require("../controllers/cartController");

router.post("/add", addtocartController);
router.get("/get", getcartController);  
router.get("/getall", allcartController);

module.exports = router;
