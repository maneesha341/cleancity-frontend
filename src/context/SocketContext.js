import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket]               = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  useEffect(() => {
    if (!user) return;

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    // Don't connect if already connected
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      forceNew: false,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', user._id);
    });

    newSocket.on('connect_error', (err) => {
      console.log('Socket error:', err.message);
      newSocket.close();
    });

    newSocket.on('newReport', (data) => {
      addNotification({ type: 'newReport', message: data.message, icon: '🗑️' });
    });

    newSocket.on('statusUpdate', (data) => {
      const icons = { assigned: '🚛', collected: '✅', resolved: '🎉' };
      addNotification({
        type:    'statusUpdate',
        message: data.message,
        icon:    icons[data.status] || '🔔'
      });
    });

    newSocket.on('newTask', (data) => {
      addNotification({ type: 'newTask', message: data.message, icon: '📋' });
    });

    return () => {
      newSocket.off('connect');
      newSocket.off('connect_error');
      newSocket.off('newReport');
      newSocket.off('statusUpdate');
      newSocket.off('newTask');
      newSocket.close();
    };
  }, [user?._id]);

  const addNotification = (notification) => {
    const n = { ...notification, id: Date.now(), time: new Date(), read: false };
    setNotifications(prev => [n, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider value={{
      socket, notifications, unreadCount, markAllRead, clearAll
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);