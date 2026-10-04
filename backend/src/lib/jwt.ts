const KNOWN_WEAK_SECRETS = new Set([
  'fallback-secret',
  'your-jwt-secret-here',
  'underground-tattoo-jwt-secret-change-in-production',
  'troque-isto-por-um-segredo-forte-e-aleatorio',
]);

/**
 * Retorna o segredo JWT ou derruba o processo: nunca assinar/verificar
 * tokens com um valor ausente, curto ou publicado no repositório.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || KNOWN_WEAK_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET ausente, fraco (<32 chars) ou valor padrão conhecido. Gere um com: openssl rand -hex 48');
  }
  return secret;
}
