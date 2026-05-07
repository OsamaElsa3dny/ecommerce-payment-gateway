const AppError = require('../utils/AppError');

function validateQuery(req, res, next) {
  const rawQ = (req.query.q || '').trim();
  const q = rawQ.length > 0 ? rawQ : null;
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  req.query.q = q;
  req.query.page = page;
  req.query.limit = limit;

  if (req.query.category_id) {
    const categoryId = parseInt(req.query.category_id);
    if (isNaN(categoryId))
      return next(new AppError('Invalid category_id', 400));
    req.query.category_id = categoryId;
  }

  if (req.query.min_price !== undefined && req.query.min_price !== '') {
    const minPrice = parseFloat(req.query.min_price);
    if (isNaN(minPrice) || minPrice < 0)
      return next(new AppError('Invalid min_price', 400));
    req.query.min_price = minPrice;
  }

  if (req.query.max_price !== undefined && req.query.max_price !== '') {
    const maxPrice = parseFloat(req.query.max_price);
    if (isNaN(maxPrice) || maxPrice < 0)
      return next(new AppError('Invalid max_price', 400));
    req.query.max_price = maxPrice;
  }

  next();
}
module.exports = validateQuery;