const validator = require('./validationHelper');
const AppError = require('../utils/AppError');

function authLogin(req, res, next) {
  const email = req.body.email.trim();
  const password = req.body.password;
  req.body.email = email;
  req.body.password = password;
  if (!validator.validateEmail(email)) {
    return next(new AppError('Invalid email', 400));
  }
  if (!validator.validatePassword(password)) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }
  next();
}

module.exports = authLogin;