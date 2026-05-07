const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const queryMiddleware = require('../middlewares/searchQueryMiddleware');

router.get('/search', queryMiddleware, productController.searchProducts);

module.exports = router;
