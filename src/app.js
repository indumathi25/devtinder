const express = require('express');
const connectDB = require('./config/database');
const { adminAuth, userAuth } = require('./middlewares/auth');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const validateSignupData = require('./utils/validation').validateSignupData;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create JWT token

    // Add the token to cookie nad send the response

    res.cookie('token', 'dummy-jwt-token', { httpOnly: true });
    res.json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error logging in', error: error.message });
  }
});

app.get('/user', async (req, res) => {
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

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
});

app.delete('/user', async (req, res) => {
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

app.patch('/user/:userId', async (req, res) => {
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

// First connect to the DB and then listen to the server
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
