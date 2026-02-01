const express = require('express');
const http = require('http');
const connectDB = require('./config/database');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Initialize Prometheus monitoring
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  promClient: {
    collectDefaultMetrics: {}
  }
});
app.use(metricsMiddleware);

app.use(
  cors({
    // Allow localhost in dev, but in production we allow the request origin (true)
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const chatRouter = require('./routes/chat');
app.use('/', chatRouter);


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
