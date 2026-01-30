const express = require('express');
const authRouter = express.Router();
const validateSignupData = require('../utils/validation').validateSignupData;
const User = require('../models/user');
const bcrypt = require('bcrypt');

authRouter.post('/signup', async (req, res) => {
  try {
    // Validate the data
    const validationResult = validateSignupData(req);
    if (!validationResult.isValid) {
      return res.status(400).json({ errors: validationResult.errors });
    }

    // Encrypt the password
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // Creating a new instance of User model
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: passwordHash,
      age: req.body.age,
      photoUrl: req.body.photoUrl,
      gender: req.body.gender,
      about: req.body.about,
      skills: req.body.skills,
    });
    await user.save();
    res.send('User signed up successfully');
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error signing up user', error: error.message });
  }
});

authRouter.post('/login', async (req, res) => {
  let { email, password } = req.body;
  email = email.trim(); // Trim whitespace
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate tokens
    const accessToken = await user.getJWT();
    const refreshToken = user.getRefreshToken();

    // Store refresh token in user's account
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Set hardened cookies
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to false since we are using HTTP (via IP) instead of HTTPS
      sameSite: 'lax',
    };

    res.cookie('token', accessToken, {
      ...cookieOptions,
      maxAge: 3600000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 3600000, // 7 days
    });

    res.json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error logging in', error: error.message });
  }
});

authRouter.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_REFRESH_SECRET || 'dev_tinder_refresh_secret';
    const decoded = jwt.verify(refreshToken, secret);

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if the refresh token is in the user's list
    const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const newAccessToken = await user.getJWT();

    // Set hardened cookie
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: false, // Set to false since we are using HTTP (via IP) instead of HTTPS
      sameSite: 'lax',
      maxAge: 3600000,
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token', error: error.message });
  }
});

authRouter.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      // Remove the refresh token from the database
      const decoded = require('jsonwebtoken').decode(refreshToken);
      if (decoded && decoded._id) {
        await User.findByIdAndUpdate(decoded._id, {
          $pull: { refreshTokens: { token: refreshToken } },
        });
      }
    } catch (err) {
      console.error('Error removing refresh token on logout:', err);
    }
  }

  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.send('Logout successful');
});

module.exports = authRouter;
