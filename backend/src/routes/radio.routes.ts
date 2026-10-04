import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest, requireSuperAdmin } from '../middlewares/auth.middleware';
import { uploadAudio } from '../middlewares/upload.middleware';
import { deleteUploadFile } from '../lib/files';

const router = Router();

// GET /api/radio/tracks
router.get('/tracks', async (_req, res) => {
  try {
    const tracks = await prisma.radioTrack.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    res.json(tracks);
  } catch (error) {
    console.error('Get radio tracks error:', error);
    res.status(500).json({ error: 'Erro ao buscar faixas' });
  }
});

// GET /api/radio/tracks/all (admin)
router.get('/tracks/all', authMiddleware, async (_req, res) => {
  try {
    const tracks = await prisma.radioTrack.findMany({
      orderBy: { order: 'asc' },
    });

    res.json(tracks);
  } catch (error) {
    console.error('Get all radio tracks error:', error);
    res.status(500).json({ error: 'Erro ao buscar faixas' });
  }
});

// POST /api/radio/tracks
router.post('/tracks', authMiddleware, requireSuperAdmin, uploadAudio.single('audio'), async (req: AuthRequest, res) => {
  try {
    const { title, artist, order } = req.body;

    if (!req.file || !title) {
      res.status(400).json({ error: 'Arquivo de áudio e título são obrigatórios' });
      return;
    }

    const track = await prisma.radioTrack.create({
      data: {
        title,
        artist,
        audioUrl: `/uploads/audio/${req.file.filename}`,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(track);
  } catch (error) {
    console.error('Create radio track error:', error);
    res.status(500).json({ error: 'Erro ao adicionar faixa' });
  }
});

// PUT /api/radio/tracks/:id
router.put('/tracks/:id', authMiddleware, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, artist, order, active } = req.body;
    const data: any = {};

    if (title) data.title = title;
    if (artist !== undefined) data.artist = artist;
    if (order !== undefined) data.order = parseInt(order);
    if (active !== undefined) data.active = active === 'true' || active === true;

    const track = await prisma.radioTrack.update({
      where: { id },
      data,
    });

    res.json(track);
  } catch (error) {
    console.error('Update radio track error:', error);
    res.status(500).json({ error: 'Erro ao atualizar faixa' });
  }
});

// DELETE /api/radio/tracks/:id
router.delete('/tracks/:id', authMiddleware, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.radioTrack.findUnique({ where: { id } });
    await prisma.radioTrack.delete({ where: { id } });
    deleteUploadFile(existing?.audioUrl);
    res.json({ message: 'Faixa excluída com sucesso' });
  } catch (error) {
    console.error('Delete radio track error:', error);
    res.status(500).json({ error: 'Erro ao excluir faixa' });
  }
});

// GET /api/radio/config
router.get('/config', async (_req, res) => {
  try {
    let config = await prisma.radioConfig.findFirst();
    if (!config) {
      config = await prisma.radioConfig.create({ data: { isOnAir: true } });
    }
    res.json(config);
  } catch (error) {
    console.error('Get radio config error:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração da rádio' });
  }
});

// PUT /api/radio/config
router.put('/config', authMiddleware, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { isOnAir } = req.body;
    let config = await prisma.radioConfig.findFirst();

    if (!config) {
      config = await prisma.radioConfig.create({ data: { isOnAir: !!isOnAir } });
    } else {
      config = await prisma.radioConfig.update({
        where: { id: config.id },
        data: { isOnAir: !!isOnAir },
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Update radio config error:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração da rádio' });
  }
});

export default router;
