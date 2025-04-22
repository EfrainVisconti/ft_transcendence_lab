import Fastify from 'fastify';
import cors from '@fastify/cors';
import { setupSocket } from './socket.js';
import { createServer } from 'http';
import routes from './routes.js';

// Crea una instancia de Fastify con logs activados.
const fastify = Fastify({ logger: true });

// Activa CORS para permitir peticiones desde cualquier origen
await fastify.register(cors, { origin: true });

// Crea un servidor HTTP independiente del de Fastify
const httpServer = createServer();

// Configura socket.io para usar el servidor HTTP
const io = setupSocket(httpServer);

// Añade la propiedad io a todos los requests
fastify.decorateRequest('io', null);

// Antes de procesar cualquier petición, adjunta la instancia de
// Socket.io (io) al objeto req. Así puedes emitir eventos desde cualquier ruta.
fastify.addHook('onRequest', async (req) => {
  req.io = io;
});

// Registra las rutas
await fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    
    // Inicia el servidor HTTP para WebSocket en el puerto 3002
    httpServer.listen(3002, () => {
      console.log('🔌 WebSocket server escuchando en puerto 3002');
    });

    console.log('🚀 Backend listo en http://localhost:3001');
  }
  catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
