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

    // Connect to socket server
   const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join personal room
    newSocket.emit('join', user._id);

    // Listen for new report (admin)
    newSocket.on('newReport', (data) => {
      addNotification({ type: 'newReport', message: data.message, icon: '🗑️' });
    });

    // Listen for status updates (citizen)
    newSocket.on('statusUpdate', (data) => {
      const icons = {
        assigned:  '🚛',
        collected: '✅',
        resolved:  '🎉'
      };
      addNotification({
        type:    'statusUpdate',
        message: data.message,
        icon:    icons[data.status] || '🔔'
      });
    });

    // Listen for new task (driver)
    newSocket.on('newTask', (data) => {
      addNotification({ type: 'newTask', message: data.message, icon: '📋' });
    });

    return () => newSocket.close();
  }, [user]);

  const addNotification = (notification) => {
    const n = { ...notification, id: Date.now(), time: new Date(), read: false };
    setNotifications(prev => [n, ...prev].slice(0, 20)); // keep last 20
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