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
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Add the token to cookie nad send the response
    const usertoken = user.getJWT();
    res.cookie('token', usertoken, {
      httpOnly: true,
      expires: new Date(Date.now() + 86400000),
    });
    res.json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error logging in', error: error.message });
  }
});

authRouter.post('/logout', (req, res) => {
  // In big compainies, we may maintain a token blacklist to invalidate tokens
  res
    .cookie('token', '', { expires: new Date(Date.now()) })
    .send('Logout successful');
  // Alternatively, you can use res.clearCookie
  //res.clearCookie('token');
});

module.exports = authRouter;
