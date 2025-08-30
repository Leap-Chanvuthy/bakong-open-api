// src/api/controllers/productController.js
const Product = require("../models/Product");
const { successResponse, errorResponse } = require("../../helpers/responseHelper");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return successResponse(res, "Products fetched successfully", products);
  } catch (err) {
    return errorResponse(res, "Failed to fetch products", err.message);
  }
};

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, currency, images, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      currency,
      images,
      stock,
    });

    return successResponse(res, "Product created successfully", product, 201);
  } catch (err) {
    return errorResponse(res, "Failed to create product", err.message, 400);
  }
};


// Get single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, "Product not found", null, 404);
    }

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, "Product not found", null, 404);
    }

    return successResponse(res, "Product fetched successfully", product);
  } catch (err) {
    return errorResponse(res, "Failed to fetch product", err.message);
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, currency, images, stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, currency, images, stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return errorResponse(res, "Product not found");
    }

    return successResponse(res, "Product updated successfully", product);
  } catch (err) {
    return errorResponse(res, "Failed to update product", err.message);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return errorResponse(res, "Product not found");
    }

    return successResponse(res, "Product deleted successfully", product);
  } catch (err) {
    return errorResponse(res, "Failed to delete product", err.message);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return errorResponse(res, "Product not found");
    }

    return successResponse(res, "Product deleted successfully", product);
  } catch (err) {
    return errorResponse(res, "Failed to delete product", err.message);
  }
};
