# Underground Tattoo & Barber

Site institucional multi-site (tattoo, barber, store…) com painel administrativo: hero/banner, serviços, profissionais, eventos, agenda, contato, músicas e rádio global.

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript
- **Backend:** Express 4 + Prisma 6 + PostgreSQL 16 (JWT, upload via Multer)
- **Infra:** um único `docker-compose.yml` na raiz sobe tudo

---

## Sumário

- [Rodando (um comando)](#rodando-um-comando)
- [Banco de dados: criação, atualização e versionamento](#banco-de-dados-criação-atualização-e-versionamento)
- [Persistência e backups](#persistência-e-backups)
- [Comandos úteis](#comandos-úteis)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Acessos e portas](#acessos-e-portas)
- [Estrutura](#estrutura)
- [API](#api)

---

## Rodando (um comando)

Primeira vez numa máquina:

```bash
cp .env.example .env     # preencha POSTGRES_PASSWORD, PGADMIN_PASSWORD e JWT_SECRET
```

Sempre (primeira vez, depois de mudar código ou schema, depois de reiniciar):

```bash
docker compose up -d --build
```

Isso sobe **postgres → pgadmin → backend → frontend**, cria a rede e as pastas de dados, cria/atualiza o banco e, se o banco estiver vazio, popula os dados iniciais.

> ⚠️ `NEXT_PUBLIC_API_URL` é embutida no bundle do frontend durante o build. Em deploy real, ajuste no `.env` **antes** do `--build`.

---

## Banco de dados: criação, atualização e versionamento

O schema é versionado em `backend/prisma/migrations/` (fonte da verdade). No boot do backend (`backend/scripts/docker-entrypoint.sh`):

| Estado do banco | O que acontece |
| --- | --- |
| **Vazio** (máquina nova) | aplica todas as migrations e roda o seed inicial (só nesse caso) |
| **Gerenciado** (tem histórico) | se houver migration pendente: **backup pg_dump** e `prisma migrate deploy` |
| **Legado** (criado por SQL/db push, sem histórico) | se o schema for idêntico ao das migrations: backup e adota o histórico sem alterar nada; se divergir, **para sem tocar no banco** |

O boot **nunca** roda `db push`, `--accept-data-loss` nem `migrate reset`.

### Mudando o schema

1. Edite `backend/prisma/schema.prisma`.
2. Gere a migration versionada (usa um Postgres temporário, nunca o banco real):
   ```bash
   cd backend
   npm run db:migration -- nome_da_mudanca
   ```
   Se a migration tiver `DROP`/troca de tipo, o script avisa. Revise o SQL (ex.: migre os dados antes do `DROP`).
3. Suba: `docker compose up -d --build`. O backend faz backup e aplica.

> Não use `prisma migrate dev` contra o banco do projeto: em caso de divergência ele oferece **reset** (apaga os dados).

---

## Persistência e backups

Tudo que importa fica em **`./data/`** (bind mounts, fora do git):

| Pasta | Conteúdo |
| --- | --- |
| `data/postgres/` | arquivos do PostgreSQL |
| `data/uploads/` | imagens e áudios enviados pelo painel |
| `data/backups/` | dumps automáticos (`*.dump`) feitos antes de cada mudança de schema |

Como são pastas do host, **nem `docker compose down -v` apaga o banco**. Só apagar `data/` manualmente remove os dados.

Backup manual / restauração:

```bash
docker exec underground_db pg_dump -U underground -d underground_tattoo -Fc > data/backups/manual-$(date +%F).dump
docker exec -i underground_db pg_restore -U underground -d underground_tattoo --clean --if-exists < data/backups/ARQUIVO.dump
```

---

## Comandos úteis

```bash
docker compose up -d --build            # build + sobe/atualiza tudo
docker compose ps                       # status
docker compose logs -f backend          # logs da API (inclui as etapas [db])
docker compose restart backend          # reinicia um serviço
docker compose down                     # para e remove containers (dados ficam em ./data)
cd backend && npm run db:status         # migrations aplicadas/pendentes (requer DATABASE_URL apontando p/ localhost:5434)
```

---

## Variáveis de ambiente

Tudo no **`.env` da raiz** (modelo comentado em `.env.example`):

| Variável | Descrição |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | credenciais do banco (senha obrigatória) |
| `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` | login do pgAdmin (senha obrigatória) |
| `JWT_SECRET` | obrigatório, ≥32 chars (`openssl rand -hex 48`); a API não sobe com valor fraco |
| `FRONTEND_URL` | origem permitida no CORS da API |
| `NEXT_PUBLIC_API_URL` | URL da API embutida no build do frontend |
| `TRUST_PROXY` | nº de proxies confiáveis (ex.: `1` atrás de nginx) |
| `SEED_ON_EMPTY` / `SEED_ADMIN_PASSWORD` | seed automático em banco vazio e a senha das contas iniciais |

`backend/.env` e `frontend/.env.local` só são usados ao rodar `npm run dev` fora do Docker.

---

## Acessos e portas

| Serviço | Endereço | Observação |
| --- | --- | --- |
| Site | http://localhost:3004 | |
| Painel | http://localhost:3004/admin | contas criadas pelo seed (senha = `SEED_ADMIN_PASSWORD`) — **troque a senha** |
| API | http://localhost:3006/api | |
| PostgreSQL | `127.0.0.1:5434` | só acessível da própria máquina |
| pgAdmin | http://127.0.0.1:5050 | só acessível da própria máquina |

---

## Estrutura

```
UndergroundTattoo/
├── docker-compose.yml   # stack completa (use este)
├── .env / .env.example  # variáveis da stack
├── data/                # banco, uploads e backups (não versionar)
├── backend/             # API Express + Prisma
│   ├── prisma/          # schema.prisma, migrations/ (versionadas), seed.ts
│   ├── scripts/         # docker-entrypoint.sh, db-state.js, new-migration.sh
│   └── src/
├── frontend/            # Next.js (App Router)
├── database/            # init SQL/schema de referência (não usados pela stack)
└── docs/                # documentação e relatório de segurança
```

> Os `docker-compose.yml` dentro de `database/`, `backend/` e `frontend/` são **obsoletos**. Não os use junto com o da raiz.

---

## API

Base: `http://localhost:3006/api`

| Recurso         | Rota base            | Observação                                        |
| --------------- | -------------------- | ------------------------------------------------- |
| Auth            | `/auth`              | `POST /auth/login` → retorna JWT                  |
| Hero / banner   | `/hero`              | `GET /hero/all` (admin); upload de imagem         |
| Serviços        | `/services`          | CRUD + imagem                                     |
| Profissionais   | `/professionals`     | CRUD + imagem                                     |
| Eventos         | `/events`            | CRUD + imagem                                     |
| Contato         | `/contact`           | `GET/PUT /contact/:site` (`TATTOO`/`BARBER`)      |
| Rádio           | `/radio`             | tracks (upload de áudio) + config "no ar"         |
| Agendamentos    | `/appointments`      | barbearia                                         |
| Upload          | `/upload`            | upload genérico (imagens/áudio via Multer)        |

Rotas de escrita (POST/PUT/DELETE) exigem **JWT** no header `Authorization: Bearer <token>`.
