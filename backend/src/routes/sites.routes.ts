import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest, requireSuperAdmin, canAccessSite, isSuperAdmin, forbid } from '../middlewares/auth.middleware';

// Campos com efeito global (rota pública, site padrão, visibilidade) — só SUPER_ADMIN
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const PRIVILEGED_SITE_FIELDS = ['slug', 'active', 'order', 'isDefault', 'isTemplate'];

const router = Router();

function sanitizeSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/sites - Active sites (public)
router.get('/', async (_req, res) => {
  try {
    const sites = await prisma.site.findMany({
      where: { active: true },
      orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
    });
    res.json(sites);
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({ error: 'Erro ao buscar sites' });
  }
});

// GET /api/sites/all - All sites (admin)
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const sites = await prisma.site.findMany({
      where: isSuperAdmin(req) ? {} : { id: req.userSiteId || '__no_site__' },
      orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
    });
    res.json(sites);
  } catch (error) {
    console.error('Get all sites error:', error);
    res.status(500).json({ error: 'Erro ao buscar sites' });
  }
});

// GET /api/sites/:slugOrId - Get single site by slug or ID (public)
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
    });

    if (!site) {
      res.status(404).json({ error: 'Site não encontrado' });
      return;
    }

    res.json(site);
  } catch (error) {
    console.error('Get site error:', error);
    res.status(500).json({ error: 'Erro ao buscar site' });
  }
});

// POST /api/sites - Create new site (admin)
router.post('/', authMiddleware, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      name, slug, title, subtitle, badge, accentColor, order,
      hasAgenda, hasWhatsappCard, whatsappCardTitle, whatsappCardText, whatsappCardMessage, hasMusicPlayer,
      isTemplate,
    } = req.body;

    if (!name || !title) {
      res.status(400).json({ error: 'Nome e título são obrigatórios' });
      return;
    }

    if (accentColor && !HEX_COLOR.test(accentColor)) {
      res.status(400).json({ error: 'Cor inválida. Use o formato #RRGGBB.' });
      return;
    }

    const finalSlug = slug ? sanitizeSlug(slug) : sanitizeSlug(name);

    const existing = await prisma.site.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      res.status(409).json({ error: `Já existe um site com a rota/slug "${finalSlug}"` });
      return;
    }

    const site = await prisma.site.create({
      data: {
        name,
        slug: finalSlug,
        title,
        subtitle,
        badge,
        accentColor: accentColor || '#c41e3a',
        order: order ? parseInt(order) : 0,
        hasAgenda: hasAgenda === 'true' || hasAgenda === true,
        hasWhatsappCard: hasWhatsappCard === undefined ? true : (hasWhatsappCard === 'true' || hasWhatsappCard === true),
        whatsappCardTitle: whatsappCardTitle || 'Atendimento Direto via WhatsApp',
        whatsappCardText: whatsappCardText || 'Fale diretamente com nossa equipe para dúvidas, agendamentos ou orçamentos.',
        whatsappCardMessage: whatsappCardMessage || `Olá! Vim pelo site da ${name}.`,
        hasMusicPlayer: hasMusicPlayer === undefined ? true : (hasMusicPlayer === 'true' || hasMusicPlayer === true),
        isTemplate: isTemplate === 'true' || isTemplate === true,
      },
    });

    await prisma.contactInfo.create({
      data: {
        siteId: site.id,
      },
    });

    res.status(201).json(site);
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ error: 'Erro ao criar novo site' });
  }
});

// PUT /api/sites/:id - Update site (admin)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!canAccessSite(req, id)) {
      forbid(res);
      return;
    }

    if (!isSuperAdmin(req) && PRIVILEGED_SITE_FIELDS.some(f => req.body[f] !== undefined)) {
      res.status(403).json({ error: 'Apenas o super admin pode alterar rota, visibilidade, ordem, padrão ou template do site' });
      return;
    }

    const {
      name, slug, title, subtitle, badge, accentColor, active, order,
      hasAgenda, hasWhatsappCard, whatsappCardTitle, whatsappCardText, whatsappCardMessage, hasMusicPlayer,
      isDefault, isTemplate,
    } = req.body;
    const data: any = {};

    if (name) data.name = name;
    if (slug) data.slug = sanitizeSlug(slug);
    if (title) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (badge !== undefined) data.badge = badge;
    if (accentColor) {
      if (!HEX_COLOR.test(accentColor)) {
        res.status(400).json({ error: 'Cor inválida. Use o formato #RRGGBB.' });
        return;
      }
      data.accentColor = accentColor;
    }
    if (active !== undefined) data.active = active === 'true' || active === true;
    if (order !== undefined) data.order = parseInt(order);
    if (hasAgenda !== undefined) data.hasAgenda = hasAgenda === 'true' || hasAgenda === true;
    if (hasWhatsappCard !== undefined) data.hasWhatsappCard = hasWhatsappCard === 'true' || hasWhatsappCard === true;
    if (whatsappCardTitle !== undefined) data.whatsappCardTitle = whatsappCardTitle;
    if (whatsappCardText !== undefined) data.whatsappCardText = whatsappCardText;
    if (whatsappCardMessage !== undefined) data.whatsappCardMessage = whatsappCardMessage;
    if (hasMusicPlayer !== undefined) data.hasMusicPlayer = hasMusicPlayer === 'true' || hasMusicPlayer === true;
    if (isDefault !== undefined) data.isDefault = isDefault === 'true' || isDefault === true;
    if (isTemplate !== undefined) data.isTemplate = isTemplate === 'true' || isTemplate === true;

    const site = await prisma.site.update({
      where: { id },
      data,
    });

    res.json(site);
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({ error: 'Erro ao atualizar site' });
  }
});

// DELETE /api/sites/:id - Delete site (admin)
router.delete('/:id', authMiddleware, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.site.delete({ where: { id } });
    res.json({ message: 'Site excluído com sucesso' });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({ error: 'Erro ao excluir site' });
  }
});

export default router;
