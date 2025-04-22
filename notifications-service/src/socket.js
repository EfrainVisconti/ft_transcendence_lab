import { Server } from 'socket.io';

// Esta función se encarga de configurar Socket.io
export const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Cuando un usuario se conecta, el servidor WebSocket maneja la conexión
  // El callback recibe un objeto socket, que representa la conexión con ese cliente
  io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;

    if (userId) {
      // Si hay un userId, mete ese socket a una sala llamada user_123, por ejemplo.
      // Esto permite enviar mensajes a todos los sockets de ese usuario
      // en lugar de enviar mensajes a todos los sockets de la aplicación
      socket.join(`user_${userId}`);
      console.log(`Usuario conectado: ${userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${userId}`);
    });
  });

  // Retorna la instancia de Socket.io
  // para que pueda ser utilizada en otras partes de la aplicación
  return io;
};
