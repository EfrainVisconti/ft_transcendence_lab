import db from "./db.js";

export async function createUserProfile({ id, username, email }) {
  const stmt = db.prepare(`
    INSERT INTO users (id, username, email)
    VALUES (?, ?, ?)
  `);
  stmt.run(id, username, email);
}

export function getUserProfile(userId) {
  const stmt = db.prepare(`
    SELECT id, username, email, avatar_url, experience, created_at
    FROM users
    WHERE id = ?
  `);
  return stmt.get(userId);
}

export function updateUserProfile(userId, { username, email, avatar_url }) {
  const fields = [];
  const values = [];

  if (username) {
    fields.push(`username = ?`);
    values.push(username);
  }
  if (email) {
    fields.push(`email = ?`);
    values.push(email);
  }
  if (avatar_url) {
    fields.push(`avatar_url = ?`);
    values.push(avatar_url);
  }

  if (fields.length === 0) return;

  const stmt = db.prepare(`
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ?
  `);

  values.push(userId);
  stmt.run(...values);
}

const uploadDir = path.join(process.cwd(), 'uploads/profile_pics');

export async function saveAvatar(userId, file) {

  const extension = path.extname(file.filename);
  const filename = `user_${userId}${extension}`;
  const filePath = path.join(uploadDir, filename);

  await file.toFile(filePath);

  const avatarUrl = `/uploads/profile_pics/${filename}`;

  db.prepare(`UPDATE users SET avatar_url = ? WHERE id = ?`).run(avatarUrl, userId);

  return avatarUrl;
}