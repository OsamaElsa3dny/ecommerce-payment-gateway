const AppError = require('../utils/AppError');

const validateSeller = (req, res, next) => {
  const { store_name, description } = req.body;

  if (!store_name || typeof store_name !== 'string' || store_name.trim().length === 0) {
    return next(new AppError('store_name is required and must be a non-empty string', 400));
  }
  req.body.store_name = store_name.trim();

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return next(new AppError('description must be a string', 400));
  }

  next();
};

module.exports = {
  validateSeller,
};
