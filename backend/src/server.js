require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const slaService = require('./services/slaService');
const requestForwardingService = require('./services/requestForwardingService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/queries', require('./routes/queryRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after MongoDB connection
async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, function () {
      console.log(
        'Server running in ' +
        process.env.NODE_ENV +
        ' mode on port ' +
        PORT
      );

      // Start SLA monitoring service
      slaService.startSLAMonitoring();

      // Start request auto-forwarding service
      requestForwardingService.startForwardingService();
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', function (err) {
      console.error('Error: ' + err.message);

      server.close(function () {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Failed to start server: ' + error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;