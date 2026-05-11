const AppError = require('../utils/AppError');
const { addToCart, getCart } = require('../services/cartService');

const addToCartController = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!Number.isInteger(product_id) || product_id <= 0) {
      throw new AppError('Product ID must be a positive integer', 400);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError('Quantity must be a positive integer', 400);
    }

    const result = await addToCart({ product_id, quantity, user_id });
    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
const getCartController = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const cart = await getCart({ user_id });
    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart
    });
  } catch (error) {
    next(error)
  }
};
module.exports = { addToCartController, getCartController };
