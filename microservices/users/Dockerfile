FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y sqlite3

# COPY package.json package-lock.json ./

# RUN npm install --omit=optional

COPY . .

RUN mkdir -p /app/data

# Exponemos el puerto que usa Fastify
EXPOSE 5000

# Comando para iniciar el servidor
CMD ["sh", "node_start.sh"]