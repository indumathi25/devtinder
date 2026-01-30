const express = require('express');
const http = require('http');
const connectDB = require('./config/database');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(
  cors({
    // Allow localhost in dev, but in production we can be more restrictive or allow the dynamic origin
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());


const server = http.createServer(app);

const initializeSocket = require('./config/utils/socket');
initializeSocket(server);

const PORT = 7777;
server.listen(PORT, () => {
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
