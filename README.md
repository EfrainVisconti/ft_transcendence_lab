## Backend como microservicios

### 1. Microservicios
En lugar de hacer un backend monolítico (donde todo está en una sola aplicación), lo dividimos en múltiples microservicios Cada microservicio debe gestionar una única responsabilidad. Ejemplo:
- Auth Service → Maneja autenticación y registro.
- Game Service → Maneja las partidas de ping pong.
- Chat Service → Maneja los mensajes entre usuarios.
- Stats Service → Guarda estadísticas de los jugadores.

### 2. Límites
Cada microservicio debe tener límites bien definidos y exponer una API clara para comunicarse con los demás. Para esto:
- Usamos endpoints RESTful o mensajería asíncrona (RabbitMQ, Redis Pub/Sub, Kafka).
- Evitamos que un microservicio dependa demasiado de otro para mantener la independencia.
- Definimos contratos API bien documentados para que otros servicios sepan cómo interactuar.

### 3. Comunicación
Como cada microservicio es independiente, deben poder intercambiar información de forma eficiente:

- REST API (HTTP/JSON)

Para solicitudes directas entre microservicios. Ejemplo: Game Service consulta a User Service con GET /api/users/{id}.

- Mensajería Asíncrona (RabbitMQ, Kafka, Redis Pub/Sub)

Para eventos como "Un usuario ganó un torneo" → Tournament Service envía un mensaje que Stats Service recibe y actualiza el ranking.

### 4. Ventajas
Cada microservicio debe hacer una sola cosa bien. Esto facilita:
- Mantenimiento → Si hay un error en el chat, no afecta el sistema de juegos.
- Escalabilidad → Puedes aumentar solo los servicios que necesiten más recursos (ejemplo: escalar el Game Service si hay muchos jugadores).
- Flexibilidad → Puedes actualizar partes del backend sin afectar todo el sistema.

## Bases de Datos (SQLite)

Cada microservicio debe tener su propia base de datos para mantener el principio de independencia y evitar acoplamiento entre servicios. Por defecto, **SQLite**  no está diseñado para ejecutarse en un contenedor separado porque es una base de datos basada en archivos locales y no en una conexión de red como MySQL o PostgreSQL.

En nuestro proyecto, cada microservicio tiene su propia base de datos **SQLite** dentro de su contenedor Docker. Y Se usa un volumen Docker para persistir los datos y que no se pierdan al reiniciar el contenedor.

### 1. Ventajas

- Fácil de gestionar y desplegar.
- No requiere una conexión de red adicional entre el microservicio y la base de datos.
- Perfecto para **SQLite**, ya que es una base de datos liviana basada en archivos.

### 2. Desventajas

- Si el contenedor se borra sin un volumen persistente, se perderán los datos.
- No es óptimo si en el futuro cambias a una base de datos más potente (ej. PostgreSQL, MySQL), con las cuales es mejor usar un contenedor aparte para cada base de datos.