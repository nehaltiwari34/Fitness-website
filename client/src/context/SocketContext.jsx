import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Use environment variable or fallback to localhost for development
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
        
        console.log('🔌 Connecting to socket:', SOCKET_URL);
        
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            timeout: 10000
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server:', reason);
            setIsConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('🔌 Socket error:', error);
        });

        newSocket.on('connect_error', (error) => {
            console.error('🔌 Connection error:', error);
            setIsConnected(false);
        });

        // Real-time event listeners
        newSocket.on('workoutStatsUpdate', (data) => {
            console.log('📊 Real-time workout update:', data);
        });

        newSocket.on('nutritionUpdate', (data) => {
            console.log('🍎 Real-time nutrition update:', data);
        });

        newSocket.on('commentAdded', (data) => {
            console.log('💬 Real-time comment:', data);
        });

        setSocket(newSocket);

        return () => {
            console.log('🔌 Cleaning up socket connection');
            newSocket.close();
        };
    }, []);

    const value = {
        socket,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};