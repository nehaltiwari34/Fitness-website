const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);

        // Join workout room
        socket.on('joinWorkout', (workoutId) => {
            socket.join(workoutId);
            console.log(`User joined workout room: ${workoutId}`);
        });

        // Join exercise room for comments
        socket.on('joinExercise', (exerciseId) => {
            socket.join(exerciseId);
            console.log(`User joined exercise room: ${exerciseId}`);
        });

        // Join dashboard for real-time updates
        socket.on('joinDashboard', (userId) => {
            socket.join(`dashboard-${userId}`);
            console.log(`User joined dashboard: ${userId}`);
        });

        // Handle workout progress updates
        socket.on('workoutProgress', (data) => {
            socket.to(data.workoutId).emit('workoutProgressUpdate', data);
        });

        // Handle live comments
        socket.on('newComment', (data) => {
            socket.to(data.targetId).emit('commentAdded', data);
        });

        // Handle workout completion
        socket.on('workoutCompleted', (data) => {
            socket.to(`dashboard-${data.userId}`).emit('workoutStatsUpdate', data);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });

        socket.on('error', (error) => {
            console.error('🔌 Socket error:', error);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};