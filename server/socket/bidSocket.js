const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a product auction room
    socket.on('join_room', (productId) => {
      socket.join(`product_${productId}`);
      console.log(`📦 Socket ${socket.id} joined room: product_${productId}`);
    });

    // Leave a product auction room
    socket.on('leave_room', (productId) => {
      socket.leave(`product_${productId}`);
      console.log(`👋 Socket ${socket.id} left room: product_${productId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
