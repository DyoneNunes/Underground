import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest, canAccessSite, forbid } from '../middlewares/auth.middleware';
import { publicFormLimiter } from '../middlewares/rateLimit.middleware';

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

// GET /api/contact/:site
router.get('/:site', async (req, res) => {
  try {
    const { site } = req.params;
    const siteId = await resolveSiteId(site);

    if (!siteId) {
      res.json({
        phone: null, whatsapp: null, email: null,
        address: null, latitude: null, longitude: null, instagram: null,
      });
      return;
    }

    const contact = await prisma.contactInfo.findUnique({
      where: { siteId },
    });

    if (!contact) {
      res.json({
        phone: null, whatsapp: null, email: null,
        address: null, latitude: null, longitude: null, instagram: null,
      });
      return;
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Erro ao buscar informações de contato' });
  }
});

// PUT /api/contact/:site
router.put('/:site', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { site } = req.params;
    const siteId = await resolveSiteId(site);

    if (!siteId) {
      res.status(404).json({ error: 'Site não encontrado' });
      return;
    }

    if (!canAccessSite(req, siteId)) {
      forbid(res);
      return;
    }

    const { phone, whatsapp, email, address, latitude, longitude, instagram } = req.body;

    const contact = await prisma.contactInfo.upsert({
      where: { siteId },
      update: { phone, whatsapp, email, address, latitude, longitude, instagram },
      create: {
        siteId,
        phone, whatsapp, email, address, latitude, longitude, instagram,
      },
    });

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Erro ao atualizar informações de contato' });
  }
});

// POST /api/contact/message
router.post('/message', publicFormLimiter, async (req, res) => {
  try {
    const { name, email, phone, message, siteType, siteId } = req.body;
    const targetSiteId = await resolveSiteId(siteId || siteType);

    if (!name || !email || !message || !targetSiteId) {
      res.status(400).json({ error: 'Nome, email, mensagem e site são obrigatórios' });
      return;
    }

    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, phone, message, siteId: targetSiteId },
    });

    res.status(201).json({ id: contactMessage.id, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// GET /api/contact/messages/:site (admin)
router.get('/messages/:site', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { site } = req.params;
    const siteId = await resolveSiteId(site);

    if (!siteId) {
      res.json([]);
      return;
    }

    if (!canAccessSite(req, siteId)) {
      forbid(res);
      return;
    }

    const messages = await prisma.contactMessage.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

export default router;
