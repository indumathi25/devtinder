const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
// Importing routes
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

const app = express();

// Helmet middleware for security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    // Allow localhost in dev, but in production we allow the request origin (true)
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
    credentials: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Health check for Nginx/Load Balancer
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Using the routes
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Connect to DB after starting the listener
  connectDB()
    .then(() => {
      console.log('Database connected successfully');
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
    });
});
