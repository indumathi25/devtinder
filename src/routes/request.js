const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');

requestRouter.post(
  '/request/send/:status/:toUserId',
  userAuth,
  async (req, res, next) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    try {
      const allowedStatuses = ['ignored', 'interested'];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({ message: 'Invalid status value provided' });
      }
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if a request already exists
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      // const existingRequest = await ConnectionRequest.findOne({
      if (existingRequest) {
        return res
          .status(400)
          .json({ message: 'Connection request already sent' });
      }

      // Create a new connection request
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      await connectionRequest.save();
      res.json({
        message:
          req.user.firstName + ' is ' + status + ' in ' + toUser.firstName,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error sending connection request',
        error: error.message,
      });
    }
  }
);

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  async (req, res, next) => {
    const loggedInUser = req.user;
    const { requestId, status } = req.params;

    try {
      const allowedStatuses = ['accepted', 'rejected'];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({ message: 'Invalid status value provided' });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: { $in: ['interested'] },
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: 'Connection request not found to review' });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName +
          ' has ' +
          status +
          ' the connection request from user ' +
          loggedInUser._id,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error reviewing connection request',
        error: error.message,
      });
    }
  }
);

module.exports = requestRouter;
