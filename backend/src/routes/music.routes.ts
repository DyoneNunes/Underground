import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest, canAccessSite, forbid, scopeSiteId } from '../middlewares/auth.middleware';
import { requireSiteOwnership, discardUpload, isSafeMediaUrl } from '../lib/siteAccess';

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

// GET /api/music?site=...
router.get('/', async (req, res) => {
  try {
    const { site } = req.query;
    const siteId = await resolveSiteId(site);

    const where: any = { active: true };
    if (siteId) where.siteId = siteId;

    const musicLinks = await prisma.siteMusicLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json(musicLinks);
  } catch (error) {
    console.error('Get music links error:', error);
    res.status(500).json({ error: 'Erro ao buscar links de música' });
  }
});

// GET /api/music/all?site=... (admin)
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { site } = req.query;
    const siteId = scopeSiteId(req, await resolveSiteId(site));

    const where: any = {};
    if (siteId) where.siteId = siteId;

    const musicLinks = await prisma.siteMusicLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json(musicLinks);
  } catch (error) {
    console.error('Get all music links error:', error);
    res.status(500).json({ error: 'Erro ao buscar links de música' });
  }
});

// POST /api/music
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, artist, url, type, siteId, siteType, order } = req.body;
    const targetSiteId = await resolveSiteId(siteId || siteType);

    if (!title || !url || !targetSiteId) {
      discardUpload(req);
      res.status(400).json({ error: 'Título, URL e site são obrigatórios' });
      return;
    }

    if (!canAccessSite(req, targetSiteId)) { discardUpload(req); forbid(res); return; }

    if (!isSafeMediaUrl(url)) {
      res.status(400).json({ error: 'URL inválida. Use um link http(s).' });
      return;
    }

    const musicLink = await prisma.siteMusicLink.create({
      data: {
        title,
        artist,
        url,
        type: type || 'spotify',
        siteId: targetSiteId,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(musicLink);
  } catch (error) {
    console.error('Create music link error:', error);
    res.status(500).json({ error: 'Erro ao cadastrar link de música' });
  }
});

// PUT /api/music/:id
router.put('/:id', authMiddleware, requireSiteOwnership('siteMusicLink'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, artist, url, type, order, active } = req.body;
    const data: any = {};

    if (title) data.title = title;
    if (artist !== undefined) data.artist = artist;
    if (url) {
      if (!isSafeMediaUrl(url)) {
        res.status(400).json({ error: 'URL inválida. Use um link http(s).' });
        return;
      }
      data.url = url;
    }
    if (type) data.type = type;
    if (order !== undefined) data.order = parseInt(order);
    if (active !== undefined) data.active = active === 'true' || active === true;

    const musicLink = await prisma.siteMusicLink.update({
      where: { id },
      data,
    });

    res.json(musicLink);
  } catch (error) {
    console.error('Update music link error:', error);
    res.status(500).json({ error: 'Erro ao atualizar link de música' });
  }
});

// DELETE /api/music/:id
router.delete('/:id', authMiddleware, requireSiteOwnership('siteMusicLink'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.siteMusicLink.delete({ where: { id } });
    res.json({ message: 'Link de música excluído com sucesso' });
  } catch (error) {
    console.error('Delete music link error:', error);
    res.status(500).json({ error: 'Erro ao excluir link de música' });
  }
});

export default router;
