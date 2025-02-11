all: up

# Levanta todos los servicios en segundo plano.
up:
	sudo docker compose -f docker-compose.yml up --build -d

# Detiene y elimina todos los servicios.
down:
	sudo docker compose -f docker-compose.yml down

re: down up

# Limpia el sistema Docker eliminando contenedores detenidos,
# imágenes no referenciadas, redes no utilizadas.
prune: down
	sudo docker system prune -a -f

.PHONY: all up down re prune