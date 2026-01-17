const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(
    'mongodb+srv://indumathi25:indumathi25@namastenode.hywhhq9.mongodb.net/devTinder?appName=NamasteNode'
  );
};

module.exports = connectDB;
