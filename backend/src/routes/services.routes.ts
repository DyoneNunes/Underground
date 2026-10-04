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

// GET /api/services?site=tattoo|barber|store|id
router.get('/', async (req, res) => {
  try {
    const { site } = req.query;
    const siteId = await resolveSiteId(site);

    const where: any = { active: true };
    if (siteId) where.siteId = siteId;

    const services = await prisma.service.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// GET /api/services/all?site=... (admin)
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { site } = req.query;
    const siteId = scopeSiteId(req, await resolveSiteId(site));

    const where: any = {};
    if (siteId) where.siteId = siteId;

    const services = await prisma.service.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json(services);
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// POST /api/services
router.post('/', authMiddleware, uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { name, description, siteType, siteId, order } = req.body;
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';

    const targetSiteId = await resolveSiteId(siteId || siteType);

    if (!name || !description || !targetSiteId) {
      discardUpload(req);
      res.status(400).json({ error: 'Nome, descrição e site são obrigatórios' });
      return;
    }

    if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        imageUrl,
        siteId: targetSiteId,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// PUT /api/services/:id
router.put('/:id', authMiddleware, requireSiteOwnership('service'), uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, siteType, siteId, order, active } = req.body;
    const data: any = {};

    if (name) data.name = name;
    if (description) data.description = description;
    const targetSiteId = await resolveSiteId(siteId || siteType);
    if (targetSiteId) {
      if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }
      data.siteId = targetSiteId;
    }
    if (order !== undefined) data.order = parseInt(order);
    if (active !== undefined) data.active = active === 'true' || active === true;
    if (req.file) data.imageUrl = `/uploads/images/${req.file.filename}`;

    const service = await prisma.service.update({
      where: { id },
      data,
    });

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', authMiddleware, requireSiteOwnership('service'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.service.findUnique({ where: { id } });
    await prisma.service.delete({ where: { id } });
    deleteUploadFile(existing?.imageUrl);
    res.json({ message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

export default router;
