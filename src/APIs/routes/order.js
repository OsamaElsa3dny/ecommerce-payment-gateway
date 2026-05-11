const router = require('express').Router();
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const { placeOrder } = require('../controllers/orderController');

router.use(jwtMiddleware);
router.post('/', placeOrder);

module.exports = router;
