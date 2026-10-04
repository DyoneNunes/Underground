#!/bin/sh
# Boot do backend: cria/atualiza o banco SÓ com migrations versionadas
# (prisma/migrations) e NUNCA executa operação destrutiva (sem db push,
# sem --accept-data-loss, sem migrate reset). Antes de qualquer mudança de
# schema, faz backup com pg_dump em /app/backups.
set -eu

PRISMA=./node_modules/.bin/prisma

backup() {
  mkdir -p /app/backups
  file="/app/backups/$(date +%Y%m%d-%H%M%S)-$1.dump"
  echo "[db] backup → $file"
  # pg_dump não aceita o parâmetro ?schema= do Prisma
  pg_dump --format=custom --file="$file" "${DATABASE_URL%%\?*}"
}

STATE=$(node scripts/db-state.js state)
echo "[db] estado: $STATE"

if [ "$STATE" = "legacy" ]; then
  # Banco criado por init SQL / db push: só adota o histórico se o schema já
  # for idêntico ao das migrations. Se divergir, para sem tocar em nada.
  if $PRISMA migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code >/dev/null 2>&1; then
    backup baseline
    for dir in prisma/migrations/*/; do
      $PRISMA migrate resolve --applied "$(basename "$dir")"
    done
  else
    echo "[db] ERRO: banco existente sem histórico de migrations e com schema diferente do atual."
    echo "[db] Nada foi alterado. Gere uma migration que leve este banco ao schema e suba de novo."
    exit 1
  fi
elif [ "$STATE" = "managed" ]; then
  # migrate status sai != 0 quando há migrations pendentes
  if ! $PRISMA migrate status >/dev/null 2>&1; then
    backup pre-migrate
  fi
fi

$PRISMA migrate deploy

if [ "${SEED_ON_EMPTY:-true}" = "true" ] && node scripts/db-state.js is-empty; then
  echo "[db] banco vazio → seed inicial"
  node dist-seed/seed.js
fi

exec node dist/server.js
