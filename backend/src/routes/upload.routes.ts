import { Router } from 'express';
import { authMiddleware, requireSuperAdmin } from '../middlewares/auth.middleware';
import { uploadImage, uploadAudio } from '../middlewares/upload.middleware';

const router = Router();

// Upload avulso (sem vínculo a registro/site): restrito ao super admin para evitar
// arquivos órfãos e esgotamento de disco por qualquer admin de site.

// POST /api/upload/image
router.post('/image', authMiddleware, requireSuperAdmin, uploadImage.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado' });
    return;
  }

  res.json({
    url: `/uploads/images/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

// POST /api/upload/audio
router.post('/audio', authMiddleware, requireSuperAdmin, uploadAudio.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado' });
    return;
  }

  res.json({
    url: `/uploads/audio/${req.file.filename}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

export default router;
