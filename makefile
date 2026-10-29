BUN := bun
PODMAN_COMPOSE := podman compose
INFISICAL_ENV ?= dev
COMPOSE_BASE := --project-directory . -f docker/compose/base.yml
COMPOSE_DEV := $(COMPOSE_BASE) -f docker/compose/development.yml
COMPOSE_PROD := $(COMPOSE_BASE) -f docker/compose/production.yml

.PHONY: help dev build start typecheck lint format db-gen db-mig db-studio data-encrypt-preview data-encrypt-apply clean dc-up dc-bg dc-down dc-reset dc-restart dc-prod-up dc-prod-bg dc-prod-down

help:
	@echo "=============================================================================="
	@echo "                         POSYANDU SERVER - MAKEFILE                          "
	@echo "=============================================================================="
	@echo "Perintah Aplikasi Utama:"
	@echo "------------------------------------------------------------------------------"
	@echo "  make dev         : Menjalankan server lokal dalam mode development (watch)"
	@echo "  make build       : Mengompilasi kode TypeScript ke JavaScript (dist/)"
	@echo "  make start       : Menjalankan hasil compile di production"
	@echo "  make typecheck   : Memeriksa validasi tipe TypeScript tanpa melakukan emit"
	@echo "  make lint        : Memeriksa kualitas kode menggunakan ESLint"
	@echo "  make format      : Merapikan format kode menggunakan Prettier & ESLint"
	@echo "  make clean       : Menghapus folder build (dist/) secara lokal"
	@echo "------------------------------------------------------------------------------"
	@echo "Database (Drizzle ORM):"
	@echo "  make db-gen      : Membuat file migrasi database berdasarkan skema"
	@echo "  make db-mig      : Mengeksekusi file migrasi ke dalam database"
	@echo "  make db-studio   : Membuka GUI dashboard Drizzle Studio"
	@echo "  make data-encrypt-preview : Melihat jumlah data lama yang belum terenkripsi"
	@echo "  make data-encrypt-apply   : Mengenkripsi data lama (setelah backup)"
	@echo "------------------------------------------------------------------------------"
	@echo "Podman Compose Environment (Infisical env: $(INFISICAL_ENV)):"
	@echo "  make dc-up       : Menjalankan app dan PostgreSQL di foreground"
	@echo "  make dc-bg       : Menjalankan app dan PostgreSQL di background"
	@echo "  make dc-down     : Menghentikan dan menghapus semua kontainer/resource"
	@echo "  make dc-reset    : Menghapus kontainer dan volume database lokal"
	@echo "  make dc-restart  : Memuat ulang (restart) semua layanan container"
	@echo "  make dc-prod-up  : Menjalankan app production dan PostgreSQL"
	@echo "  make dc-prod-bg  : Menjalankan app production di background"
	@echo "  make dc-prod-down: Menghentikan stack production"
	@echo "=============================================================================="

dev:
	infisical run --env=$(INFISICAL_ENV) -- $(BUN) run dev

build:
	$(BUN) run build

start:
	infisical run --env=$(INFISICAL_ENV) -- $(BUN) run start

typecheck:
	$(BUN) run typecheck

lint:
	$(BUN) run lint:check

format:
	$(BUN) run format:fix

clean:
	rm -rf dist

db-gen:
	infisical run --env=$(INFISICAL_ENV) -- $(BUN) run db:generate

db-mig:
	infisical run --env=$(INFISICAL_ENV) -- $(BUN) run db:migrate

db-studio:
	infisical run --env=$(INFISICAL_ENV) -- $(BUN) run db:studio

data-encrypt-preview:
	infisical run --env=$(INFISICAL_ENV) -- $(BUN) run data:encrypt-sensitive

data-encrypt-apply:
	infisical run --env=$(INFISICAL_ENV) -- $(BUN) run data:encrypt-sensitive -- --apply

dc-up:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-dev $(COMPOSE_DEV) up --build app postgres
 
dc-bg:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-dev $(COMPOSE_DEV) up --build -d app postgres
	
dc-down:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-dev $(COMPOSE_DEV) down --remove-orphans

dc-reset:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-dev $(COMPOSE_DEV) down --remove-orphans --volumes

dc-restart:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-dev $(COMPOSE_DEV) restart

dc-prod-up:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-prod $(COMPOSE_PROD) up --build app postgres

dc-prod-bg:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-prod $(COMPOSE_PROD) up --build -d app postgres

dc-prod-down:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null -p posyandu-prod $(COMPOSE_PROD) down --remove-orphans
