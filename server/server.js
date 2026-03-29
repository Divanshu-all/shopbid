const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initSocket = require('./socket/bidSocket');
const { startAuctionCron } = require('./utils/auctionCron');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/shops',    require('./routes/shop'));
app.use('/api/products', require('./routes/product'));
app.use('/api/bids',     require('./routes/bid'));
app.use('/api/orders',   require('./routes/order'));
app.use('/api/payment',  require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ShopBid API running ✅' }));

// Global error handler — prints actual error to terminal
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// Initialize Socket.io handlers
initSocket(io);

// Start auction cron job
startAuctionCron(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 ShopBid server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Run this command to free it:`);
    console.error(`   for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT}') do taskkill /PID %a /F`);
    process.exit(1);
  }
});
