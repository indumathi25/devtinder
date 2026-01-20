const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

// Get all the pending connection requests for the logged-in user
userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const connectionRequests = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: 'interested',
    })
      .populate('fromUserId', 'firstName lastName email photoUrl skills')
      .populate('toUserId', 'firstName lastName email photoUrl skills');

    res.json(connectionRequests);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user connections',
      error: error.message,
    });
  }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      status: 'accepted',
    })
      .populate('fromUserId', 'firstName lastName email photoUrl skills')
      .populate('toUserId', 'firstName lastName email photoUrl skills');

    const data = connections.map((row) => {
      if (loggedInUser._id.toString() === row.fromUserId._id.toString())
        return row.toUserId;
      return row.fromUserId;
    });
    res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user connections',
      error: error.message,
    });
  }
});

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    // User should not see
    //  1. himself in the feed
    //  2. His connection
    //  3. He ignored the connection
    //  4. Who already sent request to him (interested)
    //  5. Whom he already sent request (interested)

    //TODO: Write feed to filter the user based on the skill set also.
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // Max limit is 50
    const skip = (page - 1) * limit;

    // Find all the connection request either sent or received.
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select('fromUserId toUserId');

    // Extract userIds to exclude from feed
    const excludedUserIds = new Set();
    excludedUserIds.add(loggedInUser._id.toString());
    connectionRequests.forEach((request) => {
      excludedUserIds.add(request.fromUserId.toString());
      excludedUserIds.add(request.toUserId.toString());
    });

    // Fetch users excluding the ones in excludedUserIds
    const feedUsers = await User.find({
      _id: { $nin: Array.from(excludedUserIds) },
    })
      .select('firstName lastName email photoUrl skills')
      .skip(skip)
      .limit(limit);

    res.json(feedUsers);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user feed',
      error: error.message,
    });
  }
});

module.exports = userRouter;
