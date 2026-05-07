const db = require('../../config/db');
const AppError = require('../utils/AppError');

const becomeSeller = async ({ user_id, store_name, description }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM sellers WHERE user_id = $1',
      [user_id]
    );
    if (existing.rows.length) {
      throw new AppError('User is already a seller', 409);
    }

    const sellerResult = await client.query(
      `INSERT INTO sellers (user_id, store_name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, store_name, description]
    );

    const userResult = await client.query(
      `UPDATE users SET role = 'seller' WHERE id = $1 RETURNING id, name, email, role`,
      [user_id]
    );

    await client.query('COMMIT');

    return {
      seller: sellerResult.rows[0],
      user: userResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  becomeSeller,
};
