const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users/all
// @access  Private (CEO only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create single user
// @route   POST /api/users
// @access  Private (CEO only)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, employeeId, department } = req.body;

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
        message: 'Employee ID is already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      employeeId,
      department: department || undefined
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department
      }
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      if (error.keyPattern.employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is already registered'
        });
      }
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
    }
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (CEO only)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, department } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (CEO only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create users
// @route   POST /api/users/bulk
// @access  Private (CEO only)
exports.bulkCreateUsers = async (req, res, next) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of users'
      });
    }

    const results = {
      created: [],
      failed: []
    };

    for (const userData of users) {
      try {
        const { name, email, password, phone, role, employeeId, department } = userData;

        // Validate required fields
        if (!name || !email || !password || !phone || !role || !employeeId) {
          results.failed.push({
            user: userData,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check for existing user
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
          results.failed.push({
            user: userData,
            error: 'Email already exists'
          });
          continue;
        }

        const existingUserByEmployeeId = await User.findOne({ employeeId });
        if (existingUserByEmployeeId) {
          results.failed.push({
            user: userData,
            error: 'Employee ID already exists'
          });
          continue;
        }

        // Create user
        const user = await User.create({
          name,
          email,
          password,
          phone,
          role,
          employeeId,
          department: department || undefined
        });

        results.created.push({
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId
        });
      } catch (error) {
        results.failed.push({
          user: userData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Created ${results.created.length} users, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    next(error);
  }
};
