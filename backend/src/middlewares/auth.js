const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { getJWTPublicKey } = require('../utils/secrets');

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error('Unauthorized');
    }

    const publicKey = await getJWTPublicKey();

    let decoded;
    if (!publicKey) {
      console.warn('JWT_PUBLIC_KEY not found, falling back to static secret (DEVELOPMENT ONLY)');
      decoded = jwt.verify(token, 'dev_tinder_secret_key');
    } else {
      decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Error:', error: error.message });
  }
};

module.exports = { userAuth };
