const router = require('express').Router();
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const sellerController = require('../controllers/sellerController');
const { validateSeller } = require('../middlewares/sellerValidationMiddleware');
const validateProduct = require('../middlewares/productValidationMiddleware');
const { addProduct } = require('../controllers/productController');
const checkRole = require('../middlewares/roleMiddleware');

router.post('/onboard', jwtMiddleware, validateSeller, sellerController.becomeSeller);
router.post('/products', jwtMiddleware, checkRole('seller'), validateProduct, addProduct);

module.exports = router;
