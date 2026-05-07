const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const queryMiddleware = require('../middlewares/query');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const checkRole = require('../middlewares/checkRole');
const validateProduct = require('../middlewares/validateProduct');

router.get('/search', queryMiddleware, productController.searchProducts);
router.post(
  '/add',
  jwtMiddleware,
  checkRole('seller'),
  validateProduct,
  productController.addProduct
);

module.exports = router;
