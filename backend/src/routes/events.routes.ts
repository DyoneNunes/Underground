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

// GET /api/events?site=...
router.get('/', async (req, res) => {
  try {
    const { site } = req.query;
    const siteId = await resolveSiteId(site);

    const where: any = { active: true };
    if (siteId) where.siteId = siteId;

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// GET /api/events/all?site=... (admin)
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { site } = req.query;
    const siteId = scopeSiteId(req, await resolveSiteId(site));

    const where: any = {};
    if (siteId) where.siteId = siteId;

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(events);
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// POST /api/events
router.post('/', authMiddleware, uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { title, description, date, location, siteType, siteId } = req.body;
    const targetSiteId = await resolveSiteId(siteId || siteType);

    if (!title || !description || !date || !targetSiteId) {
      discardUpload(req);
      res.status(400).json({ error: 'Título, descrição, data e site são obrigatórios' });
      return;
    }

    if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        siteId: targetSiteId,
        imageUrl: req.file ? `/uploads/images/${req.file.filename}` : null,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// PUT /api/events/:id
router.put('/:id', authMiddleware, requireSiteOwnership('event'), uploadImage.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, siteType, siteId, active } = req.body;
    const data: any = {};

    if (title) data.title = title;
    if (description) data.description = description;
    if (date) data.date = new Date(date);
    if (location !== undefined) data.location = location;
    const targetSiteId = await resolveSiteId(siteId || siteType);
    if (targetSiteId) {
      if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }
      data.siteId = targetSiteId;
    }
    if (active !== undefined) data.active = active === 'true' || active === true;
    if (req.file) data.imageUrl = `/uploads/images/${req.file.filename}`;

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authMiddleware, requireSiteOwnership('event'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.event.findUnique({ where: { id } });
    await prisma.event.delete({ where: { id } });
    deleteUploadFile(existing?.imageUrl);
    res.json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Erro ao excluir evento' });
  }
});

export default router;
