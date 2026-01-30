import { io } from 'socket.io-client';
import { CHAT_URL } from './constants';

export const createSocketConnection = () => {
  return io(CHAT_URL, {
    transports: ['websocket'],
    withCredentials: true,
  });
};
