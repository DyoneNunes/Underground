import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// A extensão gravada em disco vem SEMPRE do MIME aceito, nunca do nome enviado
// pelo cliente — evita que "x.html" (declarado como image/png) seja servido como página.
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/aac': '.aac',
};

const uploadRejection = (message: string) => Object.assign(new Error(message), { isUploadRejection: true });

const storageFor = (subdir: string, types: Record<string, string>) => multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads', subdir));
  },
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${types[file.mimetype]}`);
  },
});

const filterFor = (types: Record<string, string>, message: string) =>
  (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (Object.prototype.hasOwnProperty.call(types, file.mimetype)) {
      cb(null, true);
    } else {
      cb(uploadRejection(message));
    }
  };

export const uploadImage = multer({
  storage: storageFor('images', IMAGE_TYPES),
  fileFilter: filterFor(IMAGE_TYPES, 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.'),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 20, fieldSize: 100 * 1024 }, // 10MB
});

export const uploadAudio = multer({
  storage: storageFor('audio', AUDIO_TYPES),
  fileFilter: filterFor(AUDIO_TYPES, 'Tipo de arquivo não suportado. Use MP3, WAV, OGG ou AAC.'),
  limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 20, fieldSize: 100 * 1024 }, // 50MB
});
