const mongoose = require('mongoose');

// Creating the schema
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['ignored', 'accepted', 'rejected', 'interested'],
      default: 'ignored',
      message: '{VALUE} is not supported',
    },
  },
  { timestamps: true }
);

// Creating a unique compound index to prevent duplicate requests
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Pre-save hook to prevent self-connection requests
connectionRequestSchema.pre('save', function (next) {
  if (this.fromUserId.toString() === this.toUserId.toString()) {
    throw new Error(
      'fromUserId and toUserId cannot be the same in a connection request'
    );
  }
  // next();
});

// Creating the model
const ConnectionRequest = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema
);

module.exports = ConnectionRequest;
