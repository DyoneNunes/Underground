import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getJwtSecret } from '../lib/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userSiteId?: string | null;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Token mal formatado' });
    return;
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(parts[1], getJwtSecret(), { algorithms: ['HS256'] }) as { id: string };
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  try {
    // Papel e site vêm do banco (não do token): usuário removido ou rebaixado perde acesso na hora
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, siteId: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.userSiteId = user.siteId;
    next();
  } catch (error) {
    console.error('Auth lookup error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    next();
  };
};

export const requireSuperAdmin = requireRole('SUPER_ADMIN');

export const isSuperAdmin = (req: AuthRequest): boolean => req.userRole === 'SUPER_ADMIN';

/** SUPER_ADMIN acessa qualquer site; SITE_ADMIN apenas o próprio. */
export const canAccessSite = (req: AuthRequest, siteId?: string | null): boolean => {
  if (isSuperAdmin(req)) return true;
  return !!siteId && !!req.userSiteId && siteId === req.userSiteId;
};

/**
 * Site efetivo para listagens admin: SITE_ADMIN é sempre restrito ao próprio site,
 * independentemente do que vier na query.
 */
export const scopeSiteId = (req: AuthRequest, requested?: string): string | undefined => {
  if (isSuperAdmin(req)) return requested;
  return req.userSiteId || '__no_site__';
};

export const forbid = (res: Response): void => {
  res.status(403).json({ error: 'Acesso negado' });
};
