# Project API

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)

API REST con autenticación JWT.
Consumida por [`project_frontend`](https://github.com/MateoTorresD/ing-web-frontend).

## Índice

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos y migraciones](#base-de-datos-y-migraciones)
- [Scripts y pruebas](#scripts-y-pruebas)
- [Autor](#autor)

## Características

- Todas las rutas requieren JWT, salvo las marcadas con `@Public()` (`POST /api/auth/login`).
- Usuario inicial creado automáticamente (_seed_) si la tabla de usuarios está vacía.

## Tecnologías

NestJS 11 · TypeScript · TypeORM · PostgreSQL 16 · JWT (`@nestjs/jwt`) · Argon2 ·
class-validator · Jest + Supertest · Docker Compose (solo la DB)

## Requisitos

- Node.js 22 LTS (o 20.12+, por el uso de `process.loadEnvFile`) y npm
- Docker y Docker Compose (para PostgreSQL), o una instancia propia de PostgreSQL 16

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.template .env
# editar .env (ver sección siguiente)

# 3. Levantar PostgreSQL
docker compose up -d

# 4. Aplicar migraciones
npm run db:migration:run

# 5. Iniciar la API
npm run start:dev
```

La API queda en `http://localhost:<PORT>/api`.
Al primer arranque se crea el usuario definido en las variables `SEED_*`.

## Variables de entorno

| Variable                                                                            | Descripción                                                           |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `PORT`                                                                              | Puerto de la API (por defecto `3000`)                                 |
| `CORS_ORIGINS`                                                                      | Orígenes permitidos, separados por coma (ej. `http://localhost:5173`) |
| `POSTGRES_HOST` / `POSTGRES_PORT`                                                   | Host y puerto de la DB                                                |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`                               | Credenciales y nombre de la DB (también las usa Docker Compose)       |
| `JWT_ACCESS_SECRET`                                                                 | Secreto de firma, **mínimo 32 caracteres**                            |
| `JWT_ACCESS_TTL_SECONDS`                                                            | Duración del token en segundos (entero positivo)                      |
| `SEED_FIRST_NAME`, `SEED_LAST_NAME`, `SEED_USERNAME`, `SEED_EMAIL`, `SEED_PASSWORD` | Usuario inicial (la contraseña requiere mínimo 8 caracteres)          |

## Base de datos y migraciones

El esquema se gestiona solo con migraciones (`synchronize: false`).

```bash
# Generar una migración a partir de los cambios en las entidades
npm run db:migration:generate -- src/db/migrations/<nombre>

npm run db:migration:run      # aplicar pendientes
npm run db:migration:revert   # revertir la última
```

## Endpoints

Prefijo global: `/api`. Autenticación: `Authorization: Bearer <token>`.

## Scripts y pruebas

| Comando              | Descripción                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| `npm run start:dev`  | Desarrollo con recarga                                                  |
| `npm run build`      | Compila a `dist/`                                                       |
| `npm run start:prod` | Ejecuta el build                                                        |
| `npm run lint`       | ESLint (con autofix)                                                    |
| `npm test`           | Pruebas unitarias                                                       |
| `npm run test:e2e`   | Pruebas e2e (**requieren una DB de pruebas con migraciones aplicadas**) |

## Autor

[Mateo Torres](https://github.com/MateoTorresD)
