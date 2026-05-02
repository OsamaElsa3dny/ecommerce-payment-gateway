const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginValidate = require('../middlewares/loginValidate');
const registerValidate = require('../middlewares/registerValidate');
router.post('/register', registerValidate, authController.registerController);
router.post('/login', loginValidate, authController.loginController);
module.exports = router;