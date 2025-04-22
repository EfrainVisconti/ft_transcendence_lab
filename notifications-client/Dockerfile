FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Hacemos el build de producción
RUN npm run build

# Usamos nginx para servir los archivos
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# Reemplaza el default.conf si querés rutas específicas
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
