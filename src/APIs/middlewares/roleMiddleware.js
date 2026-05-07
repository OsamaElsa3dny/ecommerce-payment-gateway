const AppError = require('../utils/AppError');

const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (req.user.role !== role) {
      return next(new AppError('Access denied', 403));
    }
    next();
  };
};

module.exports = checkRole;
