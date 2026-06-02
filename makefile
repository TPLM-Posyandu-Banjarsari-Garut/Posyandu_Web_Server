BUN := bun
DOCKER_COMPOSE := docker compose

.PHONY: help dev build start typecheck lint format db-gen db-mig db-studio clean dc-up dc-down dc-restart

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
	@echo "  make docs        : Memperbarui atau membuat dokumentasi Swagger API"
	@echo "  make clean       : Menghapus folder build (dist/) secara lokal"
	@echo "------------------------------------------------------------------------------"
	@echo "Database (Drizzle ORM):"
	@echo "  make db-gen      : Membuat file migrasi database berdasarkan skema"
	@echo "  make db-mig      : Mengeksekusi file migrasi ke dalam database"
	@echo "  make db-studio   : Membuka GUI dashboard Drizzle Studio"
	@echo "------------------------------------------------------------------------------"
	@echo "Docker Compose Environment:"
	@echo "  make dc-up       : Menjalankan semua container di latar belakang (-d)"
	@echo "  make dc-down     : Menghentikan dan menghapus semua kontainer/resource"
	@echo "  make dc-restart  : Memuat ulang (restart) semua layanan container"
	@echo "=============================================================================="

dev:
	$(BUN) run dev

build:
	$(BUN) run build

start:
	$(BUN) run start

typecheck:
	$(BUN) run typecheck

lint:
	$(BUN) run lint:check

format:
	$(BUN) run format:fix

docs:
	$(BUN) run docs

clean:
	rm -rf dist

db-gen:
	$(BUN) run db:generate

db-mig:
	$(BUN) run db:migrate

db-studio:
	$(BUN) run db:studio

dc-up:
	DOCKER_BUILDKIT=1 $(DOCKER_COMPOSE) up --build app-dev postgres
 
dc-bg:
	DOCKER_BUILDKIT=1 $(DOCKER_COMPOSE) up -d
	
dc-down:
	$(DOCKER_COMPOSE) down --remove-orphans

dc-restart:
	$(DOCKER_COMPOSE) restart 