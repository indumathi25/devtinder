import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createSocketConnection } from '../utils/socket';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const user = useSelector((store) => store.user);

  // Fetch Chat History
  const { data: chatData, isLoading } = useQuery({
    queryKey: ['chat', targetUserId],
    queryFn: () => api.get(`/chat/${targetUserId}`),
    enabled: !!user,
  });

  useEffect(() => {
    if (chatData?.messages) {
      const formattedMessages = chatData.messages.map((m) => ({
        user: {
          firstName: m.senderId?.firstName || 'Friend',
          lastName: m.senderId?.lastName || '',
        },
        text: m.text,
      }));
      setMessages(formattedMessages);
    }
  }, [chatData]);

  // Use a ref to hold the socket instance to persist between renders without causing re-renders
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const newSocket = createSocketConnection();
    socketRef.current = newSocket;

    newSocket.emit('joinChat', {
      firstName: user.firstName,
      userId: user._id,
      targetUserId,
    });

    newSocket.on('messageReceived', (msg) => {
      const { firstName, lastName, text } = msg;
      setMessages((prev) => [
        ...prev,
        {
          user: {
            firstName,
            lastName,
          },
          text: text,
        },
      ]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, targetUserId]);

  const sendMessage = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('sendMessage', {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user._id,
      targetUserId,
      text: newMessage,
    });
    setNewMessage('');
  };

  return (
    <div className='w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col'>
      <h1 className='p-5 border-b border-gray-600'>Chat</h1>
      <div className='flex-1 overflow-scroll p-5'>
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                'chat ' +
                (msg.user.firstName === user?.firstName ? 'chat-end' : 'chat-start')
              }
            >
              <div className='chat-header'>
                {`${msg.user.firstName}  ${msg.user.lastName}`}
                <time className='text-xs opacity-50'>Now</time>
              </div>
              <div className='chat-bubble'>{msg.text}</div>
              <div className='chat-footer opacity-50'>Seen</div>
            </div>
          );
        })}
      </div>
      <div className='p-5 border-t border-gray-600 flex items-center gap-2'>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className='flex-1 input input-bordered'
          placeholder='Type a message...'
        ></input>
        <button onClick={sendMessage} className='btn btn-secondary'>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
