const productService = require('../services/product');
const searchProducts = async (req, res, next) => {
  try {
    const { q, category_id, min_price, max_price, page, limit } = req.query;
    const offset = (page - 1) * limit;
    const { products, total } = await productService.search({
      q,
      category_id,
      min_price,
      max_price,
      limit,
      offset,
    });
    return res.status(200).json({
      success: true,
      message: q ? 'Search results' : 'Products list',
      data: {
        products,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { searchProducts };