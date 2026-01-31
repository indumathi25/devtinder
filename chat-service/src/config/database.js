const mongoose = require('mongoose');
const { getMongoURI } = require('../utils/secrets');

const connectDB = async () => {
  const mongoURI = await getMongoURI();
  if (!mongoURI) {
    throw new Error('MONGO_URI not found in Secrets Manager or environment');
  }
  const dbName = mongoURI.split('/').pop().split('?')[0] || 'default';
  console.log(`Chat Service - Attempting to connect to MongoDB Database: ${dbName}`);
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s if Atlas is unreachable
  });
};

module.exports = connectDB;
