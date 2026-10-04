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

// GET /api/professionals?site=...
router.get('/', async (req, res) => {
  try {
    const { site } = req.query;
    const siteId = await resolveSiteId(site);

    const where: any = { active: true };
    if (siteId) where.siteId = siteId;

    const professionals = await prisma.professional.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(professionals);
  } catch (error) {
    console.error('Get professionals error:', error);
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

// GET /api/professionals/all?site=... (admin)
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { site } = req.query;
    const siteId = scopeSiteId(req, await resolveSiteId(site));

    const where: any = {};
    if (siteId) where.siteId = siteId;

    const professionals = await prisma.professional.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(professionals);
  } catch (error) {
    console.error('Get all professionals error:', error);
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

// POST /api/professionals
router.post('/', authMiddleware, uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { name, bio, specialty, siteType, siteId } = req.body;
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';
    const targetSiteId = await resolveSiteId(siteId || siteType);

    if (!name || !bio || !targetSiteId) {
      discardUpload(req);
      res.status(400).json({ error: 'Nome, bio e site são obrigatórios' });
      return;
    }

    if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }

    const professional = await prisma.professional.create({
      data: { name, bio, imageUrl, specialty, siteId: targetSiteId },
    });

    res.status(201).json(professional);
  } catch (error) {
    console.error('Create professional error:', error);
    res.status(500).json({ error: 'Erro ao criar profissional' });
  }
});

// PUT /api/professionals/:id
router.put('/:id', authMiddleware, requireSiteOwnership('professional'), uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, bio, specialty, siteType, siteId, active } = req.body;
    const data: any = {};

    if (name) data.name = name;
    if (bio) data.bio = bio;
    if (specialty !== undefined) data.specialty = specialty;
    const targetSiteId = await resolveSiteId(siteId || siteType);
    if (targetSiteId) {
      if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }
      data.siteId = targetSiteId;
    }
    if (active !== undefined) data.active = active === 'true' || active === true;
    if (req.file) data.imageUrl = `/uploads/images/${req.file.filename}`;

    const professional = await prisma.professional.update({
      where: { id },
      data,
    });

    res.json(professional);
  } catch (error) {
    console.error('Update professional error:', error);
    res.status(500).json({ error: 'Erro ao atualizar profissional' });
  }
});

// DELETE /api/professionals/:id
router.delete('/:id', authMiddleware, requireSiteOwnership('professional'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.professional.findUnique({ where: { id } });
    await prisma.professional.delete({ where: { id } });
    deleteUploadFile(existing?.imageUrl);
    res.json({ message: 'Profissional excluído com sucesso' });
  } catch (error) {
    console.error('Delete professional error:', error);
    res.status(500).json({ error: 'Erro ao excluir profissional' });
  }
});

export default router;
