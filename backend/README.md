# ⚡ Backend Module — Underground Tattoo API

API REST em **Node.js + Express + TypeScript + Prisma ORM** rodando em container Docker isolado.

---

### 📂 Arquivos no Diretório

| Arquivo | Descrição |
| :--- | :--- |
| `docker-compose.yml` | Orquestrador do container da API. |
| `Dockerfile` | Multi-stage build (Node 22 Alpine + TypeScript + Prisma). |
| `.env` | Variáveis de ambiente da API e string de conexão com o banco anterior. |
| `prisma/` | Schemas, migrações e script de seed do banco relacional. |
| `src/` | Código fonte das rotas, controllers e middlewares da API. |

---

### ⚙️ Variáveis de Ambiente (`.env`)

```env
PORT=3006
NODE_ENV=development

# Conexão com o Banco de Dados (IP / Host + Porta do container anterior)
DB_HOST=underground_db
DB_PORT=5432
DB_USER=underground
DB_PASSWORD=underground_secret
DB_NAME=underground_tattoo
DATABASE_URL="postgresql://underground:underground_secret@underground_db:5432/underground_tattoo?schema=public"

JWT_SECRET="underground-tattoo-jwt-secret-change-in-production"
JWT_EXPIRES_IN="7d"

FRONTEND_URL="http://localhost:3004"
```

---

### 🚀 Como Executar

```bash
cd backend
docker compose up -d --build
```

- **API Base URL:** `http://localhost:3006/api`
- **Health Check:** `http://localhost:3006/api/health`
