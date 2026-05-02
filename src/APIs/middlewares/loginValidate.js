const validator = require('./validator');
function authLogin(req, res, next) {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  req.body.email = email;
  req.body.password = password;
  if (!validator.validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }
  if (!validator.validatePassword(password)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }
  next(); 
}

module.exports = authLogin;