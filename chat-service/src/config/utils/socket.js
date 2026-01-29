const { Server } = require('socket.io');
const Chat = require('../../models/chat');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
    },
  });

  io.on('connection', (socket) => {
    socket.on('joinChat', ({ userId, targetUserId }) => {
      // We use sort, so that roomId is consistent for both users
      const roomId = [userId, targetUserId].sort().join('_');
      console.log('Joining Room : ' + roomId);
      socket.join(roomId);
    });

    socket.on('sendMessage', async ({ userId, targetUserId, text }) => {
      console.log('Message Received : ' + text);

      // Save Message to Database
      try {
        const chat = new Chat({
          senderId: userId,
          targetUserId: targetUserId,
          text: text,
        });
        await chat.save();
      } catch (err) {
        console.log(err);
      }

      const roomId = [userId, targetUserId].sort().join('_');
      io.to(roomId).emit('messageReceived', { text, senderId: userId });
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = initializeSocket;
