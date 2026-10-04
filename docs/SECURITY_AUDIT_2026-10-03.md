# Relatório de Auditoria de Segurança — Underground Tattoo

**Data:** 2026-10-03 · **Método:** Security Audit Pipeline (Discovery → Auditor → Remediator → Validator independente)
**Classificação:** CONFIDENCIAL — contém detalhes de vulnerabilidades e riscos ainda abertos.

---

## 1. Executive Summary

A auditoria encontrou **13 vulnerabilidades corrigíveis em código/configuração**. Todas foram corrigidas e **verificadas por um validador independente** (13/13 `VERIFIED`, nenhuma regressão).

A falha mais grave era a **ausência total de isolamento entre tenants**. Qualquer admin de site (ex.: `tattoo@`) podia criar, editar e excluir **qualquer** site, alterar o conteúdo dos outros, ler as mensagens de contato deles e ler, alterar ou excluir **todos os agendamentos com dados pessoais de clientes**. Somavam-se a isso o upload que permitia XSS armazenado, um segredo JWT fraco/padrão e Next.js com advisory **crítico**.

**Ainda há riscos que exigem decisão sua** (seção 10):
- Contas do painel com a senha pública `admin123`.
- Senhas padrão do Postgres e do pgAdmin.
- Container rodando como root.
- `prisma db push --accept-data-loss` executado a cada boot.

Até a senha `admin123` ser trocada, qualquer pessoa que leia o README entra no painel.

## 2. Scope

**PRE-AUTHORIZED SCOPE** (invocação do usuário): workspace `/home/andrade/Dev/UndergroundTattoo`:
- `backend/` (Express 4 + Prisma 6)
- `frontend/` (Next.js 16)
- `database/` (Postgres 16 + pgAdmin)
- Dockerfiles e composes
- Ambiente local: :3004, :3006, :5434, :5050

**Limitações:**
- **Testes dinâmicos (PoCs contra a API em execução) foram bloqueados** pelo controle de permissões da sessão. Por isso, findings e validações se baseiam em **análise estática rastreada linha a linha**, em typecheck/build, em `npm audit`, em checagens read-only de containers (`docker ps`, versão de deps no container) e em uma checagem de força do JWT_SECRET que imprime só OK/REPROVADO.
- Sem repositório git: não houve revisão de histórico de segredos.
- Fora de escopo: infraestrutura de produção (proxy, TLS, host) e CI/CD (não existe).

## 3. Assets

| Ativo | Tecnologia | Exposição |
|---|---|---|
| API `underground_backend` | Express 4.22, Prisma 6.19, multer 2.4, JWT HS256 | :3006 (0.0.0.0) |
| Frontend `underground_frontend` | Next.js 16.3.8, React 19.2 | :3004 (0.0.0.0) |
| Banco `underground_db` | Postgres 16 | 127.0.0.1:5434 (antes 0.0.0.0) |
| `underground_pgadmin` | pgAdmin 4 | 127.0.0.1:5050 (antes 0.0.0.0) |
| Volume `undergroundtattoo_uploads` | imagens/áudios servidos em `/uploads` | via API |
| Dados sensíveis | PII de clientes (agendamentos: nome, telefone, e-mail), mensagens de contato, hashes bcrypt | banco |

## 4. Attack Surface

- **Público (sem auth):**
  - `GET` em sites/services/professionals/events/hero/music/radio/contact.
  - `GET /appointments/available`.
  - **`POST /appointments`**, **`POST /contact/message`**, **`POST /auth/login`**.
  - `/uploads/*` (estático).
- **Autenticado (Bearer JWT):** todo o CRUD do CMS, uploads, agendamentos e mensagens.
- **Papéis:** `SUPER_ADMIN` (global) e `SITE_ADMIN` (um site), num modelo multi-tenant com os sites tattoo, barber e store.
- **Fluxos sensíveis:**
  - Login → token salvo em `localStorage`.
  - Upload multipart → disco → servido de volta pela própria origem da API.
  - Agendamento público → PII → painel admin.

## 5. Findings

| ID | Título | Sev. | Status da evidência | Evidência original |
|---|---|---|---|---|
| CASE-001 | Quebra de autorização multi-tenant (BOLA + escalada vertical) | **CRITICAL** | CONFIRMED (estático) | Todas as rotas de escrita/admin usavam só `authMiddleware`. `requireRole` existia e não era usado em lugar nenhum. Não havia nenhuma comparação entre o `siteId` do usuário e o do recurso. |
| CASE-002 | Upload irrestrito → XSS armazenado | HIGH | CONFIRMED (estático) | A extensão vinha de `path.extname(file.originalname)` e só o MIME declarado pelo cliente era checado. `x.html` enviado como `image/png` era salvo como `.html` e servido como `text/html`. |
| CASE-003 | Segredo JWT fraco/padrão + fallback hardcoded | HIGH | CONFIRMED | `JWT_SECRET \|\| 'fallback-secret'`. O compose tinha um default público. O segredo configurado **reprovou** na checagem de força, o que permitia forjar tokens de SUPER_ADMIN. |
| CASE-004 | Sem rate limit no login e nos formulários públicos | MEDIUM | CONFIRMED (estático) | Nenhum limitador. Brute force ilimitado contra contas que usam `admin123`. Também havia enumeração de usuários por tempo de resposta. |
| CASE-005 | Headers de segurança ausentes / `X-Powered-By` | MEDIUM | CONFIRMED | Sem helmet e sem headers no Next. Body JSON sem limite explícito. |
| CASE-006 | Error handler refletia `err.message` arbitrário | LOW | CONFIRMED (estático) | Qualquer erro virava `400 {error: err.message}`. |
| CASE-007 | Dependências vulneráveis | **CRITICAL** | CONFIRMED (npm audit) | next 16.2.7: middleware bypass, SSRF e DoS em Server Actions. postcss, sharp, nanoid. express/qs com DoS. |
| CASE-008 | URL de música aceitava qualquer esquema (`javascript:`) | LOW | CONFIRMED (estático) | A URL era renderizada em `href` na página pública. O React 19 mitiga. |
| CASE-009 | Postgres e pgAdmin publicados em 0.0.0.0 | HIGH | CONFIRMED | `docker ps`: `0.0.0.0:5434`, `0.0.0.0:5050`, com credenciais padrão documentadas no README. |
| CASE-010 | `/api/upload/*` aberto a qualquer admin (arquivos órfãos, disco) | LOW | CONFIRMED (validador) | Sem escopo e sem uso pelo frontend. Até 50MB por requisição. |
| CASE-011 | `deleteUploadFile` sem confinamento de caminho | LOW | CONFIRMED (validador) | Hoje não é explorável (as URLs são geradas pelo servidor). Era defesa em profundidade. |
| CASE-012 | `accentColor` sem validação → injeção de CSS | LOW | CONFIRMED (validador) | O valor era interpolado em estilos inline na home pública. |
| CASE-013 | multer 1.x deprecado; rate limit contornável via rotação IPv6 /64 | MEDIUM | CONFIRMED (validador) | Aviso de deprecação do npm. express-rate-limit 7 indexava o IPv6 completo. |

## 6. Risk Classification

| | Explorabilidade alta | Média | Baixa |
|---|---|---|---|
| **Impacto crítico** | CASE-001, CASE-003, CASE-007 | | |
| **Alto** | CASE-002, CASE-009 | CASE-004 | |
| **Médio** | CASE-013 | CASE-005 | |
| **Baixo** | | CASE-010, CASE-012 | CASE-006, CASE-008, CASE-011 |

## 7. Root Cause Analysis

| Causa estrutural | Casos |
|---|---|
| **Autorização dispersa e opcional:** cada rota decidia sozinha e nenhuma decidia. Não havia camada central de tenant, e o papel vinha do token, não do banco. | 001, 010 |
| **Confiança em dados do cliente:** nome de arquivo, MIME, URL, cor e status entravam sem validação. | 002, 008, 012 |
| **Configuração insegura por padrão / fail-open:** fallback de segredo, defaults públicos no compose, portas em 0.0.0.0, seed com senha conhecida. | 003, 009 |
| **Ausência de controles transversais:** rate limit, headers, tratamento de erro. | 004, 005, 006 |
| **Higiene de dependências:** versões fixas sem atualização. | 007, 013 |

## 8. Remediation Status

Todas as correções estão **implementadas** e rodando nos containers reconstruídos.

| Caso | Correção (arquivo) |
|---|---|
| 001 | `middlewares/auth.middleware.ts`: papel e site lidos do banco, `canAccessSite`/`scopeSiteId`/`requireSuperAdmin`. `lib/siteAccess.ts`: `requireSiteOwnership` (antes do multer). Checagem do site de destino em POST e ao mover registro no PUT. Listagens `/all` escopadas. `sites`: criar/excluir só SUPER_ADMIN; slug, active, order, isDefault e isTemplate só SUPER_ADMIN. `contact`, `radio` (escrita só SUPER_ADMIN), `appointments` (escopo via `professional.siteId` e whitelist de status). Frontend: aba Rádio oculta para SITE_ADMIN. |
| 002 | `middlewares/upload.middleware.ts`: extensão derivada do MIME permitido. `server.ts`: `/uploads` com `nosniff`, CSP `default-src 'none'; sandbox`, `dotfiles: deny`. |
| 003 | `lib/jwt.ts`: fail-closed (<32 caracteres ou valor conhecido derruba o boot). HS256 fixo em sign/verify. Compose com `${JWT_SECRET:?}`. **Segredo rotacionado** em `backend/.env` (as sessões antigas foram invalidadas). |
| 004 | `middlewares/rateLimit.middleware.ts`: login com 10 falhas a cada 15 min; formulários públicos com 20 a cada 15 min. bcrypt dummy contra enumeração por tempo. Suporte a `TRUST_PROXY`. |
| 005 | helmet (CORP cross-origin para as mídias), limite de 100kb no body. `next.config.ts`: `poweredByHeader: false`, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy. |
| 006 | `server.ts`: só reflete mensagens de upload conhecidas; o resto recebe resposta genérica. |
| 007 | next/eslint-config-next 16.3.8 (frontend com **0 vulnerabilidades**). `npm audit fix` no backend (express 4.22.3). |
| 008 | `isSafeMediaUrl`: só http(s) ou `/uploads/`. |
| 009 | `database/docker-compose.yml`: bind em `127.0.0.1` por padrão (`POSTGRES_BIND`/`PGADMIN_BIND` para sobrescrever). |
| 010 | `/api/upload/*` restrito a SUPER_ADMIN. |
| 011 | `lib/files.ts`: `path.resolve` + checagem de prefixo da raiz de uploads. |
| 012 | `accentColor` precisa casar com `^#[0-9a-fA-F]{6}$`. |
| 013 | multer 2.4.0 (+ `fields`/`fieldSize`), express-rate-limit 8.7.0 (IPv6 agrupado por /56). |

Backup do código pré-auditoria: `scratchpad/backup-pre-audit/src.tgz` (+ `backend.env.bak`), na pasta temporária da sessão.

## 9. Validation Results

Validador independente (subagente com contexto limpo, sem acesso às justificativas do Remediator), em duas rodadas:

- **Rodada 1 (CASE-001…009):** 9/9 `VERIFIED`. Tentou e não conseguiu os bypasses:
  - Precedência `siteId`/`siteType`.
  - `?site[]=` e `?site[a]=`.
  - `?professionalId[not]=`.
  - SITE_ADMIN com `siteId` nulo.
  - Ordem de rotas `/messages/:site`.
  - `" javascript:"`, `java\tscript:`, `data:`, `HTTPS:`.
  - alg confusion no JWT.
- **Rodada 2 (CASE-010…013):** 4/4 `VERIFIED`.
  - Path traversal: `/uploads/../x`, `/uploads/images/../../package.json`, `/uploadsX`, encodings, null byte.
  - Compatibilidade da API do multer 2 e do rate-limit 8.
  - Versões confirmadas dentro do container.
  - **Nenhuma regressão** em 001…009.
- **Testes positivos:** os fluxos do painel (SITE_ADMIN no próprio site, SUPER_ADMIN global) foram rastreados em `admin/page.tsx`. `tsc` e `next build` OK. `/api/health`, `/api/services` e a home respondem 200 após o deploy.

## 10. Open Findings (exigem ação do responsável)

| ID | Risco | Sev. | Ação recomendada |
|---|---|---|---|
| OPEN-1 | As 4 contas do painel foram criadas pelo seed com a senha **`admin123`**, que está documentada no README. Não existe endpoint de troca de senha. | **HIGH** | Trocar as senhas já (ex.: gerar um hash bcrypt e fazer `UPDATE users`) e remover as senhas do README. Implementar troca de senha. |
| OPEN-2 | Senhas padrão do Postgres (`underground_secret`) e do pgAdmin (`admin123`) em `database/.env` e `backend/.env`. | MEDIUM (agora só localhost/rede Docker) | Gerar senhas fortes. Postgres: `ALTER USER` + atualizar `DATABASE_URL`. |
| OPEN-3 | ~~`prisma db push --accept-data-loss` a cada boot~~ | **RESOLVIDO 2026-10-04** | Boot agora usa só migrations versionadas (`migrate deploy`) com backup `pg_dump`; dados em bind mounts `./data`. |
| OPEN-4 | Os containers do backend e do frontend rodam como **root**. | MEDIUM | `USER node` + `chown` do volume de uploads (o volume atual é do root; migrar com cuidado). |

## 11. Verified Findings

CASE-001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013: todos `VERIFIED` → `CLOSED`.

## 12. Accepted Risks

Nenhum risco foi formalmente aceito pelo responsável até o momento. Os itens da seção 10 aguardam decisão.

## 13. Residual Risks

- **`deepmerge-ts` <8 (high) no CLI do `prisma`:** é ferramenta de build/migração e não é alcançável por requisições. Resolver ao migrar para Prisma 7+.
- **JWT em `localStorage` com validade de 7 dias e sem revogação:** qualquer XSS futuro no frontend vaza o token. Considerar cookie `HttpOnly`/`SameSite` e expiração menor.
- **Frontend sem CSP:** pendente porque exige levantar as origens usadas (OSM iframe, API de mídia).
- **Proxy reverso:** se a API for colocada atrás de um proxy sem `TRUST_PROXY`, todos os clientes passam a dividir a mesma chave de rate limit (risco de lockout).
- **Validação estática:** sem PoC dinâmico nesta sessão, a confirmação é estática e tem a confiança correspondente.
- **Dados antigos não revalidados:** URLs de música armazenadas antes da correção não foram revalidadas (o React 19 mitiga).
- **UX:** cor com 3 dígitos (`#fff`) agora é rejeitada com mensagem de erro.
- **`GET /api/radio/tracks/all`** é legível por qualquer admin (somente leitura e global).

## 14. Security Improvements (arquiteturais)

1. Manter **toda nova rota** atrás de `requireSiteOwnership`/`canAccessSite`. Considerar testes automatizados de autorização (matriz papel × rota).
2. Validação de entrada com schema (ex.: zod) em todas as rotas, com limites de tamanho.
3. Fluxo de troca de senha, política de senha e, idealmente, MFA para SUPER_ADMIN.
4. Log de auditoria das ações administrativas (quem alterou o quê e em qual site).
5. TLS + HSTS no proxy de produção; servir `/uploads` de um domínio separado (sem cookies/tokens).
6. Versionar o projeto em git com `.env` ignorado e usar `npm audit`/Dependabot regularmente.

## 15. Audit Trail

| # | Fase | Agente | Evento |
|---|---|---|---|
| 1 | Scope | Orchestrator | Escopo pré-autorizado registrado (workspace + endpoints locais). |
| 2 | Discovery | Orchestrator/Discovery | Inventário de 11 routers, middlewares, Dockerfiles, composes e envs. |
| 3 | Detect | Auditor | Revisão estática completa do backend e dos sinks do frontend. Candidatos 001–009 identificados. |
| 4 | Prove | Auditor | Bateria de PoCs dinâmicos **bloqueada** pelo controle de permissões. Não houve contorno. Seguiu com evidência estática, `npm audit` e `docker ps`. |
| 5 | Prove | Remediator | Checagem de força do JWT_SECRET (só OK/REPROVADO): **REPROVADO** → CASE-003 confirmado. |
| 6 | Remediate | Remediator | Backup do código. Patches 001–009 aplicados, segredo rotacionado, deps atualizadas, containers recriados, smoke test 200. |
| 7 | Remediate | Remediator | Lacuna própria corrigida: placeholder do `.env.example` raiz adicionado à lista de segredos proibidos. |
| 8 | Validate | Validator (independente) | Rodada 1: 9/9 VERIFIED + novos achados 010–013 e OPEN-1…4. |
| 9 | Remediate | Remediator | Patches 010–013 aplicados, backend reconstruído. |
| 10 | Validate | Validator (independente) | Rodada 2: 4/4 VERIFIED, sem regressão. |
| 11 | Close | Orchestrator | 13 casos CLOSED. 4 riscos abertos encaminhados ao responsável. Nenhum loop de remediação excedido (máx. usado: 1). |
