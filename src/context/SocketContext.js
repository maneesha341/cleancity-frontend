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

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

    let socketInstance = null;
    let connectTimeout = null;

    // Small delay before connecting to prevent loops
    connectTimeout = setTimeout(() => {
      socketInstance = io(BACKEND_URL, {
        transports:           ['websocket', 'polling'],
        reconnectionAttempts: 3,
        reconnectionDelay:    5000,
        timeout:              20000,
      });

      socketInstance.on('connect', () => {
        console.log('✅ Socket connected');
        socketInstance.emit('join', user._id);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socketInstance.on('connect_error', (err) => {
        console.log('Socket error — notifications disabled:', err.message);
        socketInstance.close();
      });

      socketInstance.on('newReport', (data) => {
        addNotification({ type: 'newReport', message: data.message, icon: '🗑️' });
      });

      socketInstance.on('statusUpdate', (data) => {
        const icons = { assigned: '🚛', collected: '✅', resolved: '🎉' };
        addNotification({
          type:    'statusUpdate',
          message: data.message,
          icon:    icons[data.status] || '🔔'
        });
      });

      socketInstance.on('newTask', (data) => {
        addNotification({ type: 'newTask', message: data.message, icon: '📋' });
      });

      setSocket(socketInstance);
    }, 2000); // wait 2 seconds before connecting

    return () => {
      clearTimeout(connectTimeout);
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.close();
      }
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