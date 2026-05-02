const validator = require('./validator');

function authRegister(req, res, next) {
  const email = req.body.email.trim();
  const name = req.body.name.trim();
  const password = req.body.password.trim();
  req.body.email = email;
  req.body.name = name;
  req.body.password = password;
  if (!validator.validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email',
    })
  }
  if (!validator.validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters',
    })
  }
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required',
    })
  }
  next();
}
module.exports = authRegister;