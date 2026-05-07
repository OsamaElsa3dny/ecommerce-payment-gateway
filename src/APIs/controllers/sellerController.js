const sellerService = require('../services/sellerService');
const jwt = require('jsonwebtoken');

const becomeSeller = async (req, res, next) => {
  try {
    const { store_name, description } = req.body;
    const userId = req.user.id;
    const { seller, user } = await sellerService.becomeSeller({
      user_id: userId,
      store_name,
      description,
    });

    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    res.status(201).json({
      success: true,
      message: 'Seller created successfully',
      data: {
        seller,
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  becomeSeller,
};
