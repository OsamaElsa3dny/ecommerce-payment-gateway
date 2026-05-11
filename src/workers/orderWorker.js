const { Worker } = require('bullmq');
const { redisClient } = require('../config/redis');
const db = require('../config/db');

const orderWorker = new Worker(
  'order-processor',
  async (job) => {
    const { order_id } = job.data;

    const client = await db.connect();
    try {
      // 1. Check order status
      const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [order_id]);
      if (!orderRes.rows.length) {
        console.log(`Order ${order_id} not found. Skipping.`);
        return;
      }
      const order = orderRes.rows[0];

      // Already paid → nothing to do
      if (order.payment_status === 'paid') {
        console.log(`Order ${order_id} is already paid. Skipping cancellation.`);
        return;
      }

      // Already cancelled → nothing to do
      if (order.status === 'cancelled') {
        console.log(`Order ${order_id} is already cancelled. Skipping.`);
        return;
      }

      // 2. Rollback: restore stock and mark cancelled
      await client.query('BEGIN');

      const itemsRes = await client.query(
        `SELECT soi.product_id, soi.quantity
         FROM seller_order_items soi
         JOIN seller_orders so ON soi.seller_order_id = so.id
         WHERE so.order_id = $1`,
        [order_id]
      );

      for (const item of itemsRes.rows) {
        await client.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [order_id]);
      await client.query(
        "UPDATE seller_orders SET status = 'cancelled' WHERE order_id = $1",
        [order_id]
      );

      await client.query('COMMIT');
      console.log(`Order ${order_id} cancelled due to timeout.`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Failed to cancel order ${order_id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  },
  { connection: redisClient }
);

console.log('Order worker started...');

module.exports = { orderWorker };
