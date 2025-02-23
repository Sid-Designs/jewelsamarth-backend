const Product = require("../models/productModel");

const addProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      size,
      gender,
      regprice,
      saleprice,
      sku,
      stock,
      productCategory,
      productTags,
      images,
      subImages,
    } = req.body;
    if (
      !name ||
      !description ||
      !gender ||
      !regprice ||
      !saleprice ||
      !sku ||
      !stock ||
      !productCategory ||
      !productTags ||
      !images ||
      !subImages
    ) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }
    const newProduct = new Product({
      name,
      description,
      size,
      gender,
      regprice,
      saleprice,
      sku,
      stock,
      productCategory,
      productTags,
      images,
      subImages,
    });
    await newProduct.save();
    return res.json({
      success: true,
      message: "Product Added Successfully",
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Adding Product",
      error: e.message,
    });
  }
};

const getAllProductsController = async (req, res) => {
  try{
    const products = await Product.find({});
    res.json({
      products: products,
    });
    
  }catch(e){
    res.json({
      success: false,
      message: "Error Occured While Fetching Products",
      error: e.message,
    });
  }
}

module.exports = { addProductController, getAllProductsController };