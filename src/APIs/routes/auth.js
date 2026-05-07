const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginValidate = require('../middlewares/loginValidationMiddleware');
const registerValidate = require('../middlewares/registerValidationMiddleware');
router.post('/register', registerValidate, authController.registerController);
router.post('/login', loginValidate, authController.loginController);
module.exports = router;