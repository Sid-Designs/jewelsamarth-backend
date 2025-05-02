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

    // Check for products by category
    let products = await Product.find({
      productCategory: { $regex: `^${productCategory}$`, $options: "i" },
    });

    // If no products found by category, check by gender
    if (products.length === 0) {
      products = await Product.find({
        gender: { $regex: `^${productCategory}$`, $options: "i" },
      });
    }

    if (products.length === 0) {
      return res.json({
        success: false,
        message: "No products found for this category or gender",
      });
    }

    res.json({
      success: true,
      products: products,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error occurred while fetching products by category or gender",
      error: e.message,
    });
  }
};

const getProductBySearchController = async (req, res) => {
  const query = req.query.q;
  try {
    const result = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { productTags: { $regex: query, $options: "i" } },
        { productCategory: { $regex: query, $options: "i" } },
      ],
    }).select(
      "name productTags productCategory regprice saleprice description images subImages createdAt"
    );
    res.json({
      success: true,
      products: result,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching Products",
      error: e.message,
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const {productId} = req.params;
    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      {_id:productId},
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred while updating product.",
      error: error.message,
    });
  }
};

module.exports = {
  addProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByCategoryController,
  getProductBySearchController,
  updateProductController,
};
