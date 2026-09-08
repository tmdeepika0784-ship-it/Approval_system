require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const slaService = require('./services/slaService');
const requestForwardingService = require('./services/requestForwardingService');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/queries', require('./routes/queryRoutes'));
app.use('/api/cron', require('./routes/cronRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

app.use(errorHandler);

// Local development only
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(
          'Server running in ' +
          process.env.NODE_ENV +
          ' mode on port ' +
          PORT
        );

        slaService.startSLAMonitoring();
        requestForwardingService.startForwardingService();
      });

      process.on('unhandledRejection', (err) => {
        console.error('Error: ' + err.message);

        server.close(() => {
          process.exit(1);
        });
      });
    })
    .catch((error) => {
      console.error('Failed to start server: ' + error.message);
      process.exit(1);
    });
}

module.exports = app;