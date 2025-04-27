import Fastify from "fastify";
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import jwt from "jsonwebtoken";
import userRoutes from "./routes.js";

const fastify = Fastify({ logger: true });

const SECRET_KEY = "secret_key"; // Igual que login-service

await fastify.register(cors, { origin: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] });

fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
});

fastify.decorate("authenticate", async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    request.user = decoded; // { id, username }
  } catch (err) {
    reply.status(403).send({ error: "Token inválido" });
  }
});

fastify.register(userRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3002 });
    console.log("Users-service escuchando en http://localhost:3002");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

