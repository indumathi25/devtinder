const express = require('express');
// const helmet = require('helmet');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
// Importing routes
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

const app = express();

// Helmet middleware for security headers
// app.use(helmet());
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Using the routes
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

// First connect to the DB and then listen to the server
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
