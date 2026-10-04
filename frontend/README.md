# 🌐 Frontend Module — Underground Tattoo Next.js App

Aplicação web em **Next.js 16 (App Router) + React 19 + TypeScript** com suporte a Multi-Tenant CMS e Rádio Global.

---

### 📂 Arquivos no Diretório

| Arquivo | Descrição |
| :--- | :--- |
| `docker-compose.yml` | Orquestrador do container do frontend. |
| `Dockerfile` | Multi-stage build standalone do Next.js. |
| `.env` / `.env.local` | Conexão com o Backend (URL da API do container anterior). |
| `src/` | Componentes, páginas dinâmicas `[site]`, painel `admin` e contextos. |

---

### ⚙️ Variáveis de Ambiente (`.env.local`)

```env
PORT=3004
BACKEND_HOST=localhost
BACKEND_PORT=3006
NEXT_PUBLIC_API_URL=http://localhost:3006/api
```

---

### 🚀 Como Executar

```bash
cd frontend
docker compose up -d --build
```

- **Aplicação Pública:** `http://localhost:3004`
- **Painel CMS Admin:** `http://localhost:3004/admin`
