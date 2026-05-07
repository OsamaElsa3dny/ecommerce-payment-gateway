const AppError = require('../utils/AppError');

const validateProduct = (req, res, next) => {
  const { name, price, stock, category_id, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError('Name is required and must be a non-empty string', 400));
  }

  if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
    return next(new AppError('Price is required and must be a non-negative number', 400));
  }

  if (stock === undefined || stock === null || !Number.isInteger(stock) || stock < 0) {
    return next(new AppError('Stock is required and must be a non-negative integer', 400));
  }

  if (category_id !== undefined && category_id !== null && (!Number.isInteger(category_id) || category_id <= 0)) {
    return next(new AppError('Category ID must be a positive integer', 400));
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return next(new AppError('Description must be a string', 400));
  }

  next();
};

module.exports = validateProduct;
