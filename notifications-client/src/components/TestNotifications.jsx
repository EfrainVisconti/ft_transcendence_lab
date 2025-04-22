import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:3002";
const API_URL = "http://localhost:3001";

const USER_ID = 1;

const TestNotifications = () => {
  const [counts, setCounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState("friend_request");

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      query: { userId: USER_ID }
    });

    socket.on("connect", () => {
      console.log("🟢 Socket conectado");
    });

    socket.on("notification_counts", (data) => {
      console.log("🔔 Nuevos conteos:", data);
      setCounts(data);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket desconectado");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/type/${selectedType}/${USER_ID}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔔 Test Notifications</h2>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setSelectedType("friend_request")}>Friend</button>
        <button onClick={() => setSelectedType("new_message")}>Message</button>
        <button onClick={() => setSelectedType("tournament")}>Tournament</button>
        <button onClick={loadNotifications} style={{ marginLeft: 10 }}>
          Load {selectedType}
        </button>
      </div>

      <div>
        <h3>Conteos:</h3>
        <pre>{JSON.stringify(counts, null, 2)}</pre>
      </div>

      <div>
        <h3>Notificaciones {selectedType}:</h3>
        <ul>
          {notifications.map((noti, idx) => (
            <li key={idx}>{JSON.stringify(noti.content)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TestNotifications;
