const AppError = require('../utils/AppError');
const { createOrder } = require('../services/orderService');

const placeOrder = async (req, res, next) => {
  try {
    const { address_id } = req.body;
    const user_id = req.user.id;

    if (!Number.isInteger(address_id) || address_id <= 0) {
      throw new AppError('Address ID must be a positive integer', 400);
    }

    const order = await createOrder({ user_id, address_id });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. You have 15 minutes to complete payment.',
      data: {
        order_id: order.id,
        status: order.status,
        payment_status: order.payment_status,
        total_price: order.total_price,
        expires_at: order.expires_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder };
