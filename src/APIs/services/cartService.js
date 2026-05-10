const db = require('../../config/db');
const AppError = require('../utils/AppError');

const addToCart = async ({ product_id, quantity, user_id }) => {
  const productResult = await db.query(
    'SELECT id, stock, is_active FROM products WHERE id = $1',
    [product_id]
  );
  if (!productResult.rows.length) {
    throw new AppError('Product not found', 404);
  }
  const product = productResult.rows[0];
  if (!product.is_active) {
    throw new AppError('Product is not available', 400);
  }
  const cartResult = await db.query(
    'SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [user_id, product_id]
  );
  const currentCartQuantity = cartResult.rows.length ? cartResult.rows[0].quantity : 0;
  const totalQuantity = currentCartQuantity + quantity;
  if (totalQuantity > product.stock) {
    throw new AppError(
      `Insufficient stock. Available: ${product.stock}, in cart: ${currentCartQuantity}, requested: ${quantity}`,
      400
    );
  }
  const query = `
    INSERT INTO cart_items (product_id, quantity, user_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    RETURNING *
  `;
  const values = [product_id, quantity, user_id];
  const res = await db.query(query, values);
  return res.rows[0];
};

module.exports = { addToCart };