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
  try {
    const products = await Product.find({});
    res.json({
      products: products,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching Products",
      error: e.message,
    });
  }
};

const getProductByIdController = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.json({
      product: product,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching Product By ID",
      error: e.message,
    });
  }
};

const getProductByCategoryController = async (req, res) => {
  try {
    const productCategory = req.params.category;
    const gender = req.query.gender; // Assuming gender is passed as a query parameter

    const products = await Product.find({
      productCategory: { $regex: new RegExp(`^${productCategory}$`, "i") },
      gender: { $regex: new RegExp(`^${gender}$`, "i") },
    });

    if (products.length === 0) {
      return res.json({
        success: false,
        message: "No products found for this category and gender",
      });
    }

    res.json({
      success: true,
      products: products,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error occurred while fetching products by category and gender",
      error: e.message,
    });
  }
};




module.exports = {
  addProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByCategoryController,
};
