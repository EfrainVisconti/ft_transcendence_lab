FROM node:20-alpine

WORKDIR /app

RUN apk update && apk add --no-cache sqlite

# COPY package.json package-lock.json ./

# RUN npm install --omit=optional

COPY . .

RUN mkdir -p /app/data

# Exponemos el puerto que usa Fastify
EXPOSE 5000

# Comando para iniciar el servidor
CMD ["sh", "node_start.sh"]