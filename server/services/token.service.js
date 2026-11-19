const jwt = require('jsonwebtoken');

class TokenService {
  static generateTokens(payload) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'taskflow_access_default_secret_2026';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'taskflow_refresh_default_secret_2026';

    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'taskflow_access_default_secret_2026';
    return jwt.verify(token, accessSecret);
  }

  static verifyRefreshToken(token) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'taskflow_refresh_default_secret_2026';
    return jwt.verify(token, refreshSecret);
  }
}

module.exports = TokenService;
