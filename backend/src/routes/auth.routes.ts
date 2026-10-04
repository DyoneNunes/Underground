import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { getJwtSecret } from '../lib/jwt';
import { loginLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-password', 10);

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { site: { select: { id: true, slug: true, name: true } } },
    });

    // Compara mesmo sem usuário para não revelar e-mails válidos pelo tempo de resposta
    const isValidPassword = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, siteId: user.siteId },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d', algorithm: 'HS256' } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        siteId: user.siteId,
        siteSlug: user.site?.slug || null,
        siteName: user.site?.name || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, name: true, email: true, role: true, siteId: true,
        site: { select: { id: true, slug: true, name: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({
      ...user,
      siteSlug: user.site?.slug || null,
      siteName: user.site?.name || null,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
