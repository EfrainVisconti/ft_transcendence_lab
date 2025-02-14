all: build up

build:
	docker-compose -f docker-compose.yml build

# Levanta todos los servicios en segundo plano.
up:
	docker-compose -f docker-compose.yml up -d

# Detiene y elimina todos los servicios.
down:
	docker-compose -f docker-compose.yml down

re: down all

# Limpia el sistema Docker eliminando contenedores detenidos,
# imágenes no referenciadas, redes no utilizadas.
prune: down
	sudo docker system prune -a -f

.PHONY: all up down re prune