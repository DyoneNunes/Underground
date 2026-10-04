#!/bin/sh
# Gera uma nova migration versionada a partir das mudanças em prisma/schema.prisma.
#   npm run db:migration -- nome_da_mudanca
#
# Usa um Postgres TEMPORÁRIO (shadow) em container: nunca conecta no banco real,
# então não há risco de reset/perda de dados (ao contrário do `prisma migrate dev`).
# A migration é aplicada no banco real no próximo `docker compose up -d --build`.
set -eu
cd "$(dirname "$0")/.."

NAME="${1:-}"
if [ -z "$NAME" ]; then
  echo "uso: npm run db:migration -- nome_da_mudanca" >&2
  exit 1
fi

SHADOW=ut_migration_shadow
PORT=55439
docker run -d --rm --name "$SHADOW" -e POSTGRES_PASSWORD=shadow -p "127.0.0.1:$PORT:5432" postgres:16-alpine >/dev/null
trap 'docker rm -f "$SHADOW" >/dev/null 2>&1 || true' EXIT
until docker exec "$SHADOW" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 1

SQL=$(./node_modules/.bin/prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "postgresql://postgres:shadow@127.0.0.1:$PORT/postgres" \
  --script)

if ! printf '%s' "$SQL" | grep -qv '^-- This is an empty migration'; then
  echo "Nenhuma mudança no schema — nada a gerar."
  exit 0
fi

DIR="prisma/migrations/$(date -u +%Y%m%d%H%M%S)_${NAME}"
mkdir -p "$DIR"
printf '%s\n' "$SQL" > "$DIR/migration.sql"
echo "Criada: $DIR/migration.sql"

if printf '%s' "$SQL" | grep -qiE 'DROP (TABLE|COLUMN)|DROP TYPE|ALTER COLUMN .* TYPE'; then
  echo "⚠️  ATENÇÃO: esta migration contém DROP/alteração de tipo — pode apagar dados existentes."
  echo "    Revise e ajuste o SQL (ex.: copiar dados antes do DROP) antes de subir."
fi
