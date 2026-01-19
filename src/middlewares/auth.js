const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
  try {
    // validate the token
    const token = req.cookies.token;
    if (!token) {
      throw new Error('Unauthorized');
    }
    const decoded = jwt.verify(token, 'dev_tinder_secret_key');
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Error:', error: error.message });
  }
};

module.exports = { userAuth };
