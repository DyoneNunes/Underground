import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';

dotenv.config();

import authRoutes from './routes/auth.routes';
import servicesRoutes from './routes/services.routes';
import professionalsRoutes from './routes/professionals.routes';
import eventsRoutes from './routes/events.routes';
import contactRoutes from './routes/contact.routes';
import heroRoutes from './routes/hero.routes';
import radioRoutes from './routes/radio.routes';
import appointmentsRoutes from './routes/appointments.routes';
import uploadRoutes from './routes/upload.routes';
import sitesRoutes from './routes/sites.routes';
import musicRoutes from './routes/music.routes';
import { getJwtSecret } from './lib/jwt';

// Falha no boot (e não na primeira requisição) se o segredo JWT for inseguro
getJwtSecret();

const app = express();
const PORT = process.env.PORT || 3006;

// Atrás de proxy reverso (nginx/traefik) o IP real vem do X-Forwarded-For — necessário p/ rate limit
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

// Middleware
app.use(helmet({
  // Imagens/áudios de /uploads são consumidos pelo frontend em outra origem
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3004',
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve uploaded files
// nosniff + CSP sandbox: mesmo que um arquivo malicioso passe, o navegador não o executa como página
app.use('/uploads', (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  next();
}, express.static(path.join(__dirname, '..', 'uploads'), { dotfiles: 'deny', index: false }));

// Routes
app.use('/api/sites', sitesRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/radio', radioRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (keeps upload/parse failures as JSON, never raw HTML)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error handler:', err?.message || err);

  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'Arquivo muito grande. Máximo: 10MB para imagens, 50MB para áudio.',
      LIMIT_UNEXPECTED_FILE: 'Campo de arquivo inesperado.',
    };
    res.status(400).json({ error: messages[err.code] || `Erro no upload: ${err.message}` });
    return;
  }

  if (err?.isUploadRejection) {
    res.status(400).json({ error: err.message });
    return;
  }

  // JSON malformado / payload grande: resposta genérica, sem refletir detalhes internos
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    res.status(err.type === 'entity.too.large' ? 413 : 400).json({ error: 'Requisição inválida' });
    return;
  }

  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🔥 Underground Tattoo API running on http://localhost:${PORT}`);
});

export default app;
