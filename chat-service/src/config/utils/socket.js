const socket = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../../models/chat');

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash('sha256')
    .update([userId, targetUserId].sort().join('$'))
    .digest('hex');
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error('Authentication error: No cookies found'));

      const cookie = require('cookie');
      const cookies = cookie.parse(cookieHeader);
      const token = cookies.token;

      if (!token) return next(new Error('Authentication error: Token not found'));

      const jwt = require('jsonwebtoken');
      const publicKey = process.env.JWT_PUBLIC_KEY;

      if (!publicKey) {
        // Fallback for development if no public key is provided
        console.warn('JWT_PUBLIC_KEY not found, using static secret (DEVELOPMENT ONLY)');
        jwt.verify(token, 'dev_tinder_secret_key', (err, decoded) => {
          if (err) return next(new Error('Authentication error: Invalid token'));
          socket.userId = decoded._id;
          next();
        });
      } else {
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) return next(new Error('Authentication error: Invalid token'));
          socket.userId = decoded._id;
          next();
        });
      }
    } catch (err) {
      next(new Error('Authentication error: Internal error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinChat', ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + ' joined Room : ' + roomId);
      socket.join(roomId);
    });

    socket.on(
      'sendMessage',
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // Save messages to the database
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + ' ' + text);

          // TODO: Check if userId & targetUserId are friends
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit('messageReceived', { firstName, lastName, text });
        } catch (err) {
          console.log(err);
        }
      },
    );

    socket.on('disconnect', () => { });
  });
};

module.exports = initializeSocket;
