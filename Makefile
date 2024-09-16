ifneq (,$(wildcard ./.env))
	include .env
	export
endif

DOCKER_COMPOSE_FILE=docker/development/compose.yml

# Targets
.PHONY: up down

up:
	docker compose --file $(DOCKER_COMPOSE_FILE) --env-file .env up -d

down:
	docker compose --file $(DOCKER_COMPOSE_FILE) --env-file .env down

logs:
	docker compose --file $(DOCKER_COMPOSE_FILE) logs