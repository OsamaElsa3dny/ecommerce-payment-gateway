const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const queryMiddleware = require('../middlewares/query');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const app = express();
app.use(jwtMiddleware);
router.get('/search', queryMiddleware, productController.searchProducts);
module.exports = router;