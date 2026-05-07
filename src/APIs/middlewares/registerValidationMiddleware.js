const validator = require('./validationHelper');
const AppError = require('../utils/AppError');

function authRegister(req, res, next) {
  const email = req.body.email.trim();
  const name = req.body.name.trim();
  const password = req.body.password;
  req.body.email = email;
  req.body.name = name;
  req.body.password = password;
  if (!validator.validateEmail(email)) {
    return next(new AppError('Invalid email', 400));
  }
  if (!validator.validatePassword(password)) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }
  if (!name) {
    return next(new AppError('Name is required', 400));
  }
  next();
}
module.exports = authRegister;