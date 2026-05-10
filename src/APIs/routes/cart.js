const router = require('express').Router();
const { addToCartController } = require('../controllers/cartController');
const jwtMiddleware = require('../middlewares/jwtMiddleware');

router.use(jwtMiddleware);
router.post('/', addToCartController);

module.exports = router;
