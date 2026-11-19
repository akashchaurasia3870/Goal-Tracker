const crypto = require('crypto');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const ActivityLog = require('../models/ActivityLog');
const TokenService = require('./token.service');

class AuthService {
  /**
   * Register a new user
   */
  static async register({ name, email, password, role }, clientInfo = {}) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const err = new Error('Email is already registered');
      err.statusCode = 409;
      throw err;
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'User',
      verificationToken,
      isEmailVerified: false,
    });

    // Create default settings for this user
    await UserSettings.create({
      userId: user._id,
      timezone: 'UTC',
      theme: 'light',
      xpEnabled: true,
    });

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user._id,
      ipAddress: clientInfo.ip,
      userAgent: clientInfo.userAgent,
    });

    const tokens = TokenService.generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
      verificationToken, // Returned for dev/testing verification flow
    };
  }

  /**
   * Authenticate user login
   */
  static async login({ email, password }, clientInfo = {}) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Account has been deactivated. Contact an administrator.');
      err.statusCode = 403;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user._id,
      ipAddress: clientInfo.ip,
      userAgent: clientInfo.userAgent,
    });

    const tokens = TokenService.generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    // Fetch user settings
    let settings = await UserSettings.findOne({ userId: user._id });
    if (!settings) {
      settings = await UserSettings.create({ userId: user._id });
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      settings,
      ...tokens,
    };
  }

  /**
   * Refresh JWT access token
   */
  static async refresh(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Refresh token is required');
      err.statusCode = 401;
      throw err;
    }

    try {
      const decoded = TokenService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        const err = new Error('User no longer exists or is inactive');
        err.statusCode = 401;
        throw err;
      }

      const tokens = TokenService.generateTokens({
        userId: user._id.toString(),
        role: user.role,
      });

      return tokens;
    } catch (error) {
      const err = new Error('Invalid or expired refresh token');
      err.statusCode = 401;
      throw err;
    }
  }

  /**
   * Request password reset token
   */
  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal user existence, return success message for security
      return { message: 'If an account exists with this email, a reset token was generated.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    return {
      message: 'Password reset token generated successfully',
      resetToken, // Provided in response for testing/development
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      const err = new Error('Invalid or expired reset token');
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      action: 'PASSWORD_RESET',
      entityType: 'USER',
      entityId: user._id,
    });

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  /**
   * Change password for logged-in user
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    await user.save();

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: user._id,
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Email Verification
   */
  static async verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token }).select('+verificationToken');
    if (!user) {
      const err = new Error('Invalid or expired verification token');
      err.statusCode = 400;
      throw err;
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }
}

module.exports = AuthService;
