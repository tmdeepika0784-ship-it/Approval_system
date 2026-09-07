const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (phone) {
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        phone: user.phone,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users by role
// @route   GET /api/users/by-role/:role
// @access  Private
exports.getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;

    const users = await User.find({ 
      role,
      isActive: true 
    }).select('name email employeeId role department');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password change OTP
// @route   POST /api/users/request-password-change-otp
// @access  Private
exports.requestPasswordChangeOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+passwordChangeOtp +passwordChangeOtpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (5 minutes)
    user.passwordChangeOtp = otp;
    user.passwordChangeOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP via email
    await emailService.sendPasswordChangeOtpEmail(user.email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP has been sent to your email. It will expire in 5 minutes.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and change password
// @route   POST /api/users/verify-and-change-password
// @access  Private
exports.verifyAndChangePassword = async (req, res, next) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide OTP, new password, and confirm password'
      });
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Password length validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user with OTP
    const user = await User.findById(req.user.id).select('+password +passwordChangeOtp +passwordChangeOtpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP exists
    if (!user.passwordChangeOtp || !user.passwordChangeOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > user.passwordChangeOtpExpires) {
      // Clear expired OTP
      user.passwordChangeOtp = undefined;
      user.passwordChangeOtpExpires = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (user.passwordChangeOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is valid - update password
    user.password = newPassword; // Will be hashed by pre-save hook
    user.passwordChangeOtp = undefined;
    user.passwordChangeOtpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
