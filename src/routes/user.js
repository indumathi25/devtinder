const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');

// Get all the pending connection requests for the logged-in user
userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const connectionRequests = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: 'interested',
    });
    res.json(connectionRequests);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user connections',
      error: error.message,
    });
  }
});

module.exports = userRouter;
