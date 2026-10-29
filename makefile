BUN := bun
PODMAN_COMPOSE := podman compose
INFISICAL_ENV ?= dev

.PHONY: help dev build start typecheck lint format db-gen db-mig db-studio data-encrypt-preview data-encrypt-apply clean dc-up dc-bg dc-down dc-reset dc-restart

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
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null up --build app-dev postgres
 
dc-bg:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null up --build -d app-dev postgres
	
dc-down:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null down --remove-orphans

dc-reset:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null down --remove-orphans --volumes

dc-restart:
	infisical run --env=$(INFISICAL_ENV) -- $(PODMAN_COMPOSE) --env-file /dev/null restart
