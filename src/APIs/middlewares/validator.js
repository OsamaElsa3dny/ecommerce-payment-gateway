const validator = require('validator');
function validateEmail(email) {
  return validator.isEmail(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

module.exports = {
  validateEmail,
  validatePassword,
};
