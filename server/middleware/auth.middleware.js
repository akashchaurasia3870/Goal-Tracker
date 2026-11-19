const TokenService = require('../services/token.service');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

/**
 * Authentication Middleware: Verifies JWT token and attaches user to req
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.taskflow_token) {
      token = req.cookies.taskflow_token;
    }

    if (!token) {
      return ApiResponse.error(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = TokenService.verifyAccessToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return ApiResponse.error(res, 'User belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'User account has been deactivated.', 403);
    }

    // Attach user information to request
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Authentication token has expired. Please refresh your session.', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token.', 401);
  }
};

/**
 * Authorization Middleware: Role-Based Access Control
 * @param  {...string} roles Allowed roles (e.g. 'Admin', 'User')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthorized request.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, `Access denied. Role '${req.user.role}' is not authorized.`, 403);
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
