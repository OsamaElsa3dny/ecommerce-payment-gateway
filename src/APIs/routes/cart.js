const router = require('express').Router();
const { addToCartController, getCartController } = require('../controllers/cartController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
router.use(jwtMiddleware);
router.post('/', addToCartController);
router.get('/', getCartController);
module.exports = router;