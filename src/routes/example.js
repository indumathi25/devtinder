const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/user', async (req, res) => {
  const email = req.body.email;
  try {
    const users = await User.findOne({ email: email });
    if (!users) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
});

router.get('/feed', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
});

router.delete('/user', async (req, res) => {
  const userId = req.body.userId;
  try {
    // findOneAndDelete({ _id: id })
    const result = await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully', result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error deleting user', error: error.message });
  }
});

router.patch('/user/:userId', async (req, res) => {
  const userId = req.params?.userId;
  const updateData = req.body;
  const ALLOWED_UPDATES = ['photoUrl', 'about', 'skills', 'age', 'gender'];
  const isUpdateValid = Object.keys(updateData).every((field) =>
    ALLOWED_UPDATES.includes(field)
  );
  try {
    if (!isUpdateValid) {
      throw new Error('Invalid updates!');
    }
    // MongoDB ignore the field userId while updating
    const result = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });
    res.json({ message: 'User updated successfully', result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error updating user', error: error.message });
  }
});

module.exports = router;
