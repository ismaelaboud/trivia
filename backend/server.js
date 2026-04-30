const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.PROD_FRONTEND_URL,
      process.env.FRONTEND_URL,
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Attach io to app for use in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: [
    process.env.PROD_FRONTEND_URL,
    process.env.FRONTEND_URL,
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 
            'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/calls', require('./routes/calls'));

// Socket.io events
const Channel = require('./models/Channel');
const Message = require('./models/Message');

io.on('connection', (socket) => {
  
  // User joins a channel chat room
  socket.on('join_channel', async ({ channelSlug, userName }) => {
    socket.join(channelSlug);
    socket.data.channelSlug = channelSlug;
    socket.data.userName = userName;
    
    // Broadcast join message to room
    io.to(channelSlug).emit('system_message', {
      text: `${userName} joined the chat`,
      timestamp: new Date()
    });
  });
  
  // User sends a message
  socket.on('send_message', async ({ channelSlug, text, senderName, senderId }) => {
    
    // Sanitize — max 500 chars, no empty
    if (!text?.trim() || text.length > 500) return;
    
    // Find channel
    const channel = await Channel.findOne({ 
      slug: channelSlug 
    });
    if (!channel) return;
    
    // Save to DB
    const message = await Message.create({
      channel: channel._id,
      sender: senderId || null,
      senderName,
      senderInitial: senderName.charAt(0).toUpperCase(),
      text: text.trim()
    });
    
    // Broadcast to all in room
    io.to(channelSlug).emit('new_message', {
      _id: message._id,
      senderName: message.senderName,
      senderInitial: message.senderInitial,
      text: message.text,
      createdAt: message.createdAt
    });
  });
  
  // Call events
  socket.on('call_joined', ({ channelSlug, userName }) => {
    io.to(channelSlug).emit('participant_joined', {
      userName,
      timestamp: new Date()
    });
  });
  
  socket.on('call_left', ({ channelSlug, userName }) => {
    io.to(channelSlug).emit('participant_left', {
      userName,
      timestamp: new Date()
    });
  });
  
  // User leaves
  socket.on('disconnect', () => {
    if (socket.data.channelSlug && 
        socket.data.userName) {
      io.to(socket.data.channelSlug).emit(
        'system_message', {
          text: `${socket.data.userName} left`,
          timestamp: new Date()
        }
      );
    }
  });
});

// Start cron jobs
const autoReveal = require('./jobs/autoReveal');
autoReveal.setIO(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
