import { Response, NextFunction } from 'express';
import fs from 'fs';
import prisma from './prisma';
import { AuthRequest, canAccessSite, forbid } from '../middlewares/auth.middleware';

type SiteScopedModel = 'service' | 'professional' | 'event' | 'heroImage' | 'siteMusicLink';

/** Apaga o arquivo que o multer já gravou quando a requisição é rejeitada. */
export function discardUpload(req: AuthRequest): void {
  if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => { /* já removido */ });
}

/**
 * Carrega o registro de :id e só deixa passar se ele pertencer a um site que o
 * usuário pode administrar. Deve rodar ANTES do multer, para que nenhum arquivo
 * seja gravado em requisições de outro tenant.
 */
export const requireSiteOwnership = (model: SiteScopedModel) =>
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const record = await (prisma[model] as any).findUnique({
        where: { id: String(req.params.id) },
        select: { siteId: true },
      });

      if (!record) {
        res.status(404).json({ error: 'Registro não encontrado' });
        return;
      }

      if (!canAccessSite(req, record.siteId)) {
        forbid(res);
        return;
      }

      next();
    } catch (error) {
      console.error('Site ownership check error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

/** URLs de mídia aceitas: http(s) ou arquivos servidos pela própria API. */
export function isSafeMediaUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.startsWith('/uploads/') && !value.includes('..')) return true;
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}
