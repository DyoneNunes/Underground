import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest, canAccessSite, forbid, scopeSiteId } from '../middlewares/auth.middleware';
import { requireSiteOwnership, discardUpload } from '../lib/siteAccess';
import { uploadImage } from '../middlewares/upload.middleware';
import { deleteUploadFile } from '../lib/files';

const router = Router();

async function resolveSiteId(siteParam?: any): Promise<string | undefined> {
  if (!siteParam) return undefined;
  const str = String(siteParam).trim();
  const site = await prisma.site.findFirst({
    where: {
      OR: [{ id: str }, { slug: str.toLowerCase() }],
    },
    select: { id: true },
  });
  return site?.id;
}

// GET /api/hero?site=...
router.get('/', async (req, res) => {
  try {
    const { site } = req.query;
    const siteId = await resolveSiteId(site);

    const where: any = { active: true };
    if (siteId) where.siteId = siteId;

    const images = await prisma.heroImage.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json(images);
  } catch (error) {
    console.error('Get hero images error:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens do hero' });
  }
});

// GET /api/hero/all?site=... (admin)
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { site } = req.query;
    const siteId = scopeSiteId(req, await resolveSiteId(site));

    const where: any = {};
    if (siteId) where.siteId = siteId;

    const images = await prisma.heroImage.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json(images);
  } catch (error) {
    console.error('Get all hero images error:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens do hero' });
  }
});

// POST /api/hero
router.post('/', authMiddleware, uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { altText, siteType, siteId, order } = req.body;
    const targetSiteId = await resolveSiteId(siteId || siteType);

    if (!req.file || !targetSiteId) {
      discardUpload(req);
      res.status(400).json({ error: 'Imagem e site são obrigatórios' });
      return;
    }

    if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }

    const image = await prisma.heroImage.create({
      data: {
        imageUrl: `/uploads/images/${req.file.filename}`,
        altText,
        siteId: targetSiteId,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(image);
  } catch (error) {
    console.error('Create hero image error:', error);
    res.status(500).json({ error: 'Erro ao adicionar imagem' });
  }
});

// PUT /api/hero/:id
router.put('/:id', authMiddleware, requireSiteOwnership('heroImage'), uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { altText, order, active, siteId, siteType } = req.body;
    const data: any = {};

    if (altText !== undefined) data.altText = altText;
    if (order !== undefined) data.order = parseInt(order);
    if (active !== undefined) data.active = active === 'true' || active === true;
    const targetSiteId = await resolveSiteId(siteId || siteType);
    if (targetSiteId) {
      if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }
      data.siteId = targetSiteId;
    }
    if (req.file) data.imageUrl = `/uploads/images/${req.file.filename}`;

    const image = await prisma.heroImage.update({
      where: { id },
      data,
    });

    res.json(image);
  } catch (error) {
    console.error('Update hero image error:', error);
    res.status(500).json({ error: 'Erro ao atualizar imagem' });
  }
});

// DELETE /api/hero/:id
router.delete('/:id', authMiddleware, requireSiteOwnership('heroImage'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.heroImage.findUnique({ where: { id } });
    await prisma.heroImage.delete({ where: { id } });
    deleteUploadFile(existing?.imageUrl);
    res.json({ message: 'Imagem excluída com sucesso' });
  } catch (error) {
    console.error('Delete hero image error:', error);
    res.status(500).json({ error: 'Erro ao excluir imagem' });
  }
});

export default router;
