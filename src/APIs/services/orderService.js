const db = require('../../config/db');
const AppError = require('../utils/AppError');
const { orderQueue } = require('../../queues/orderQueue');

const createOrder = async ({ user_id, address_id }) => {
  const client = await db.connect();

  try {
    // 1. Get cart items with product details
    const cartRes = await client.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.is_active, p.seller_id
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [user_id]
    );

    if (!cartRes.rows.length) {
      throw new AppError('Cart is empty', 400);
    }

    // 2. Validate each item
    for (const item of cartRes.rows) {
      if (!item.is_active) {
        throw new AppError(`Product ${item.product_id} is not available`, 400);
      }
      if (item.quantity > item.stock) {
        throw new AppError(
          `Insufficient stock for product ${item.product_id}. Available: ${item.stock}, requested: ${item.quantity}`,
          400
        );
      }
    }

    // 3. Calculate total price
    const totalPrice = cartRes.rows.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 4. Get shipping address
    const addressRes = await client.query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [address_id, user_id]
    );
    if (!addressRes.rows.length) {
      throw new AppError('Address not found', 404);
    }
    const address = addressRes.rows[0];

    // 5. Start transaction
    await client.query('BEGIN');

    let order;
    try {
      // 6. Create parent order
      const orderRes = await client.query(
        `INSERT INTO orders (user_id, total_price, shipping_street, shipping_city, shipping_country, status, payment_status, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'unpaid', NOW() + INTERVAL '15 minutes')
         RETURNING *`,
        [user_id, totalPrice, address.street, address.city, address.country]
      );
      order = orderRes.rows[0];

      // 7. Group cart items by seller_id
      const itemsBySeller = {};
      for (const item of cartRes.rows) {
        if (!itemsBySeller[item.seller_id]) {
          itemsBySeller[item.seller_id] = [];
        }
        itemsBySeller[item.seller_id].push(item);
      }

      // 8. Create seller_orders and seller_order_items
      for (const sellerId of Object.keys(itemsBySeller)) {
        const sellerItems = itemsBySeller[sellerId];
        const sellerSubtotal = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const sellerOrderRes = await client.query(
          `INSERT INTO seller_orders (order_id, seller_id, subtotal, status)
           VALUES ($1, $2, $3, 'pending')
           RETURNING id`,
          [order.id, sellerId, sellerSubtotal]
        );
        const sellerOrderId = sellerOrderRes.rows[0].id;

        for (const item of sellerItems) {
          // Deduct stock
          await client.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );

          // Create seller_order_item
          await client.query(
            `INSERT INTO seller_order_items (seller_order_id, product_id, quantity, price_snapshot)
             VALUES ($1, $2, $3, $4)`,
            [sellerOrderId, item.product_id, item.quantity, item.price]
          );
        }
      }

      // 9. Clear cart
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }

    // 10. Schedule timeout job (15 minutes)
    await orderQueue.add(
      'cancel-unpaid-order',
      { order_id: order.id },
      { delay: 15 * 60 * 1000 }
    );

    return order;
  } finally {
    client.release();
  }
};

module.exports = { createOrder };
