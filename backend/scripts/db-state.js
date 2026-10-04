// Inspeciona o banco para o docker-entrypoint.sh (somente leitura).
//   node scripts/db-state.js state     → imprime: empty | legacy | managed
//   node scripts/db-state.js is-empty  → exit 0 se não há sites nem usuários
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const mode = process.argv[2];

  if (mode === 'state') {
    const [row] = await prisma.$queryRaw`
      SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS managed,
             to_regclass('public.users') IS NOT NULL AS has_tables`;
    // legacy = tabelas criadas por init SQL / db push, sem histórico de migrations
    console.log(row.managed ? 'managed' : row.has_tables ? 'legacy' : 'empty');
    return 0;
  }

  if (mode === 'is-empty') {
    const [users, sites] = await Promise.all([prisma.user.count(), prisma.site.count()]);
    return users === 0 && sites === 0 ? 0 : 1;
  }

  console.error('uso: db-state.js state|is-empty');
  return 2;
}

main()
  .then(async (code) => { await prisma.$disconnect(); process.exit(code); })
  .catch(async (err) => { console.error(err.message); await prisma.$disconnect(); process.exit(3); });
