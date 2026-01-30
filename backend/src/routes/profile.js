const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation');

profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    return res.status(401).json({ message: 'Error:', error: error.message });
  }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    validateEditProfileData(req);

    const user = req.user;
    const updates = req.body;

    // Update only the fields provided in the request body
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = profileRouter;
