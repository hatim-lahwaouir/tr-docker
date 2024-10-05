all: up

User=hlahwaou


.PHONY = down clean stop up status start


up:
	docker compose -f ./srcs/docker-compose.yml up -d --build

down:
	docker compose -f ./srcs/docker-compose.yml down