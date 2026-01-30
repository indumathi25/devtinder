import { io } from 'socket.io-client';
import { CHAT_URL } from './constants';

export const createSocketConnection = () => {
  const isProduction = location.hostname !== 'localhost';

  return io(isProduction ? '/' : CHAT_URL, {
    path: isProduction ? '/api/chat/socket.io' : '/socket.io',
    transports: ['websocket'],
    withCredentials: true,
  });
};
