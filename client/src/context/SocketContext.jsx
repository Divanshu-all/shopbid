import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || '/', { withCredentials: true, autoConnect: true });
    socketRef.current.on('connect', () => console.log('🔌 Socket connected'));
    socketRef.current.on('disconnect', () => console.log('🔴 Socket disconnected'));

    return () => { socketRef.current?.disconnect(); };
  }, []);

  const joinRoom = (productId) => socketRef.current?.emit('join_room', productId);
  const leaveRoom = (productId) => socketRef.current?.emit('leave_room', productId);
  const on = (event, cb) => socketRef.current?.on(event, cb);
  const off = (event, cb) => socketRef.current?.off(event, cb);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, joinRoom, leaveRoom, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
