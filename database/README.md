# 🐘 Database Module — Underground Tattoo

Este módulo gerencia a infraestrutura isolada do banco de dados relacional **PostgreSQL 16**, contendo os **schemas SQL**, **definições Prisma** e a interface gráfica **pgAdmin 4**.

---

### 📂 Arquivos no Diretório `database/`

| Arquivo / Pasta | Descrição |
| :--- | :--- |
| `init/01-schema.sql` | **Schema SQL Puro**: Criação de todas as tabelas, enums, chaves primárias e relacionamentos. |
| `prisma/schema.prisma` | **Schema Prisma**: Definições de modelos do Prisma ORM em sincronia com o banco. |
| `docker-compose.yml` | Orquestrador autônomo da infraestrutura de banco de dados e pgAdmin. |
| `.env` | Variáveis de ambiente com usuários, senhas e portas de rede. |
| `README.md` | Guia de uso, instruções de gerenciamento e backup. |

---

### ⚙️ Variáveis de Ambiente (`.env`)

```env
POSTGRES_USER=underground
POSTGRES_PASSWORD=underground_secret
POSTGRES_DB=underground_tattoo
POSTGRES_PORT=5434

PGADMIN_EMAIL=admin@underground.com
PGADMIN_PASSWORD=admin123
PGADMIN_PORT=5050
```

---

### 🚀 Como Executar

Para iniciar o banco de dados e o pgAdmin de forma isolada:

```bash
cd database
docker compose up -d
```

---

### 🔌 Portas e Acessos Externa/Interna

- **PostgreSQL Externo (Host):** `localhost:5434`
- **PostgreSQL Interno (Containers):** `underground_db:5432`
- **pgAdmin 4 UI:** `http://localhost:5050`
  - **Login pgAdmin:** `admin@underground.com`
  - **Senha pgAdmin:** `admin123`

---

### 🛠️ Configuração de Conexão no pgAdmin

Ao acessar `http://localhost:5050`, adicione um novo servidor com as seguintes credenciais:
- **Host name/address:** `underground_db`
- **Port:** `5432`
- **Maintenance database:** `underground_tattoo`
- **Username:** `underground`
- **Password:** `underground_secret`

---

### 💾 Backup e Restauração

#### Criar Backup (Dump SQL):
```bash
docker exec -t underground_db pg_dump -U underground underground_tattoo > backup.sql
```

#### Restaurar Backup:
```bash
cat backup.sql | docker exec -i underground_db psql -U underground -d underground_tattoo
```
