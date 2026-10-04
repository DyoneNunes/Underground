import fs from 'fs';
import path from 'path';

/**
 * Remove um arquivo de upload do disco a partir da sua URL pública
 * (ex: "/uploads/images/uuid.png"). Seguro: só apaga dentro de /uploads,
 * ignora placeholders e silencia erro se o arquivo já não existir.
 */
export function deleteUploadFile(fileUrl?: string | null): void {
  if (!fileUrl || !fileUrl.startsWith('/uploads/') || fileUrl.includes('placeholder')) return;
  const uploadsRoot = path.resolve(__dirname, '..', '..', 'uploads');
  const filePath = path.resolve(__dirname, '..', '..', `.${fileUrl}`);
  if (!filePath.startsWith(uploadsRoot + path.sep)) return;
  fs.promises.unlink(filePath).catch(() => { /* arquivo ausente: ignora */ });
}
