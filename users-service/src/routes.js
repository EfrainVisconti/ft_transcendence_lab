import { createUserProfile, getUserProfile, updateUserProfile, saveAvatar } from "./user.js";

async function userRoutes(fastify, options) {
  
  fastify.post("/createProfile", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id, username, email } = request.body;

    if (!id || !username || !email) {
      return reply.status(400).send({ error: "Datos incompletos" });
    }

    try {
      await createUserProfile({ id, username, email });
      reply.send({ success: true, message: "Perfil creado" });
    } catch (error) {
      console.error(error);
      reply.status(400).send({ error: "Error al crear perfil o ya existe" });
    }
  });

  fastify.get("/profile", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id;

    const profile = getUserProfile(userId);
    if (!profile) {
      return reply.status(404).send({ error: "Perfil no encontrado" });
    }

    reply.send(profile);
  });

  fastify.put("/profile", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id;
    const { username, email, avatar_url } = request.body;

    try {
      await updateUserProfile(userId, { username, email, avatar_url });
      reply.send({ success: true, message: "Perfil actualizado" });
    } catch (error) {
      console.error(error);
      reply.status(400).send({ error: "Error al actualizar perfil" });
    }
  });

  // Buscar usuarios por username
  fastify.get('/users/search/:username', async (request, reply) => {
    const { username } = request.params;

    const users = fastify.db.prepare(`
      SELECT id, username, avatar_url
      FROM users
      WHERE username LIKE ?
    `).all(`%${username}%`);

    if (users.length === 0) {
      return reply.status(404).send({ error: 'No se encontraron usuarios' });
    }

    reply.send({ users });
  });

  fastify.post('/uploadAvatar', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No se envió imagen" });
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: "Formato de imagen no permitido (solo JPG y PNG)" });
    }

    try {
      const filePath = await saveAvatar(request.user.id, data);
      reply.send({ success: true, avatarUrl: filePath });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Error al guardar avatar" });
    }
  });
}

export default userRoutes;
