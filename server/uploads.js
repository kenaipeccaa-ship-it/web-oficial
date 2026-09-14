/* ==========================================================================
   UPLOAD DE IMAGENS
   Arquivos vão para DATA_DIR/uploads com nome aleatório. O nome enviado pelo
   navegador nunca é usado no disco (evita travessia de caminho) e o tipo é
   validado por extensão e mimetype.
   ========================================================================== */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_FILES, UPLOADS_DIR } from './config.js'

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED.get(file.mimetype) || '.bin'
    cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error('Formato não aceito. Envie JPG, PNG, WebP, AVIF ou GIF.'))
    }
    cb(null, true)
  },
})

/** Apaga um arquivo enviado, ignorando nomes suspeitos. */
export function removeUpload(filename) {
  if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) return
  const target = path.join(UPLOADS_DIR, filename)
  if (!target.startsWith(UPLOADS_DIR)) return
  fs.promises.unlink(target).catch(() => {})
}

/** Caminho público servido pelo Express. */
export const publicUrl = (filename) => `/uploads/${filename}`
