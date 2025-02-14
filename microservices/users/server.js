require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "secret_key";

const dbFolderPath = path.join(__dirname, "data");
const dbFilePath = path.join(dbFolderPath, "users.db");

const fs = require("fs");
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
  }

//ruta db
const db = new Database(dbFilePath, { verbose: console.log });


app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(username, email, hashedPassword);
    res.json({ message: "Usuario registrado" });
  } catch {
    res.status(400).json({ error: "Usuario ya existe" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

app.get("/profile", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: "Acceso permitido", user: decoded });
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

app.listen(5000, () => console.log("API en http://localhost:5000"));