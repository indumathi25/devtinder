const express = require('express');
const http = require('http');
const connectDB = require('./config/database');

const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const initializeSocket = require('./config/utils/socket');
initializeSocket(server);

// First connect to the DB and then listen to the server
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    server.listen(7777, () => {
      console.log(`Server is running on port 7777`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
