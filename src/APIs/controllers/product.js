const productService = require('../services/product');
const db = require('../../config/db');
const AppError = require('../utils/AppError');
const searchProducts = async (req, res, next) => {
  try {
    const { q, category_id, min_price, max_price, page, limit } = req.query;
    const offset = (page - 1) * limit;
    const { products, total } = await productService.search({
      q,
      category_id,
      min_price,
      max_price,
      limit,
      offset,
    });
    return res.status(200).json({
      success: true,
      message: q ? 'Search results' : 'Products list',
      data: {
        products,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};
const addProduct = async (req, res, next) => {
  try {
    const { category_id, name, price, stock, description } = req.body;
    const sellerResult = await db.query(
      'SELECT id FROM sellers WHERE user_id = $1',
      [req.user.id]
    );
    if (!sellerResult.rows.length) {
      throw new AppError('Seller profile not found', 404);
    }
    const seller_id = sellerResult.rows[0].id;
    const newProduct = await productService.add({
      category_id,
      name,
      price,
      stock,
      description,
      seller_id,
    });
    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { searchProducts, addProduct };