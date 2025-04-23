import db from './db.js';

// Función para construir un objeto con los conteos de notificaciones por tipo
// Entrada: lista de notificaciones
// Salida: objeto como { mensaje: 3, amigos: 1 }
const buildCountsByType = (notifications) => {
  const counts = {};

  notifications.forEach(n => {
    if (!n.read) {
      counts[n.type] = (counts[n.type] || 0) + 1;
    }
  });
  return counts;
};

// Función que Fastify usa para registrar rutas
export default async function routes(fastify) {

  // Busca todas las notificaciones de ese usuario en la base de datos
  fastify.get('/notifications/:recipient_id', async (request, reply) => {

    const { recipient_id } = request.params;

    const rows = db.prepare(
      `SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC`
    ).all(recipient_id);

    // Convierte content de string a objeto
    // Convierte read a booleano
    // Devuelve array de notificaciones procesadas
    reply.code(200).send(rows.map(row => ({
      ...row,
      content: JSON.parse(row.content),
      read: !!row.read
    })));
  });

  // Busca notificaciones por tipo y destinatario en la base de datos
  fastify.get('/notifications/type/:type/:recipient_id', async (request) => {

    const { type, recipient_id } = request.params;

    const rows = db.prepare(
      `SELECT * FROM notifications WHERE recipient_id = ? AND type = ? ORDER BY created_at DESC`
    ).all(recipient_id, type);

    // Convierte content de string a objeto
    // Convierte read a booleano
    // Devuelve array de notificaciones procesadas
    return rows.map(row => ({
      ...row,
      content: JSON.parse(row.content),
      read: !!row.read
    }));

  });

  // Recibe una nueva notificación con type, content (objeto) y recipient_id
  fastify.post('/notifications', async (request, reply) => {

    const { type, content, recipient_id } = request.body;

    console.log(request.body);
    // Inserta la nueva notificación en la base de datos
    // read se guarda como 0 (no leído).
    // content se guarda como string (lo serializa con JSON.stringify).
    const stmt = db.prepare(`
      INSERT INTO notifications (type, content, read, recipient_id)
      VALUES (?, ?, 0, ?)
    `);
    const result = stmt.run(type, JSON.stringify(content), recipient_id);

    // Busca todas las notificaciones de ese usuario
    const allNotifs = db.prepare(
      `SELECT type, read FROM notifications WHERE recipient_id = ?`
    ).all(recipient_id);
    
    // Calcula cuántas no leídas hay por tipo usando buildCountsByType
   //const counts = buildCountsByType(allNotifs);

    // Envía un evento por WebSocket al usuario correspondiente con el conteo actualizado
    request.io.to(`user_${recipient_id}`).emit('new_notifications', type);

    // Envía la respuesta con el ID de la nueva notificación
    reply.code(201).send({ id: result.lastInsertRowid });
  });

  // Marca como leídas todas las notificaciones de cierto tipo para un usuario
  fastify.patch('/notifications/read/:type/:recipient_id', async (request, reply) => {

    const { type, recipient_id } = request.params;

    db.prepare(
      `UPDATE notifications SET read = 1 WHERE type = ? AND recipient_id = ?`
    ).run(type, recipient_id);

    // Responde con éxito
    reply.send({ success: true });
  });
}
