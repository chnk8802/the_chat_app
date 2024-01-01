import express from "express";
import dotenv from 'dotenv';
import colors from 'colors';
import { Server } from "socket.io";
import path from 'path';
import connectDB from '../config/db.js';
import userRoutes from '../routes/userRoutes.js';
import chatRoutes from '../routes/chatRoutes.js'
import messageRoutes from '../routes/messageRoutes.js'
import _middlewares from '../middlewares/errorMiddleware.js'

const port = process.env.PORT || 5000;

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// ------------Deployment-----------------
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, '/frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname1, 'frontend', 'dist', 'index.html'));
    })
} else {
    app.get('/', (req, res) => {
        res.send("API Running successfully!!!!!!")
    });
}
// ------------Deployment-----------------


app.use(_middlewares.notFound);
app.use(_middlewares.errorHandler);

const ExpressServer = app.listen(port, '0.0.0.0', console.log(`Server Strated on PORT ${port}`.yellow.bold));

const io = new Server(ExpressServer, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id)
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.off('setup', () => {
        console.log("User Disconnected");
        socket.leave(userData._id);
    });
});