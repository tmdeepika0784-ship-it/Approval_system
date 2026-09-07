const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Verify Employee ID
// @route   POST /api/auth/verify-employee-id
// @access  Public
exports.verifyEmployeeId = async (req, res, next) => {
  try {
    const { employeeId, role } = req.body;

    if (!employeeId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and role are required'
      });
    }

    // Check if Employee ID already exists
    const existingUser = await User.findOne({ employeeId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is already registered'
      });
    }

    // Verify Employee ID format (non-empty)
    if (employeeId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID cannot be empty'
      });
    }

    // In a real system, you would verify against an HR database
    // For now, we accept any non-empty unique Employee ID
    res.status(200).json({
      success: true,
      message: 'Employee ID is valid and available for registration',
      employeeId,
      role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, employeeId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone, role, and employeeId'
      });
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if Employee ID already exists
    const existingUserByEmployeeId = await User.findOne({ employeeId });
    if (existingUserByEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is already registered. Please use a different Employee ID.'
      });
    }

    // Verify Employee ID format (must be non-empty string)
    if (employeeId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID cannot be empty'
      });
    }

    // Verify that the selected role matches the Employee ID
    // For now, we accept any Employee ID. In production, you would verify against an HR database.
    // This is a backend validation to prevent API bypass.

    // Create user with verified Employee ID
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      employeeId
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    // Handle duplicate key error for employeeId
    if (error.code === 11000 && error.keyPattern.employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is already registered'
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
   const user = await User.findOne({ email }).select('+password');

console.log('LOGIN DEBUG - email:', email);
console.log('LOGIN DEBUG - user found:', !!user);

if (!user) {
  console.log('LOGIN DEBUG - USER NOT FOUND');
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
}

const isMatch = await user.comparePassword(password);

console.log('LOGIN DEBUG - password match:', isMatch);

if (!isMatch) {
  console.log('LOGIN DEBUG - PASSWORD DOES NOT MATCH');
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
}

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Send OTP email
    try {
      await sendPasswordResetEmail(user.email, otp);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Valid for 15 minutes.'
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:otp
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
