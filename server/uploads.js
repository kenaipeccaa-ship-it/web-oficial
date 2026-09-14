/* ==========================================================================
   UPLOAD DE IMAGENS
   O arquivo chega em memória (multer.memoryStorage) e é entregue à camada de
   armazenamento — que grava em disco no local e no Vercel Blob em produção.
   Manter em memória é o que permite o mesmo código rodar em serverless, onde
   não há filesystem gravável.

   Validação: tipo permitido por mimetype/extensão e tamanho máximo.
   ========================================================================== */
import multer from 'multer'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_FILES } from './config.js'
import { del, put } from './storage/index.js'

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
])

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error('Formato não aceito. Envie JPG, PNG, WebP, AVIF ou GIF.'))
    }
    cb(null, true)
  },
})

/** Grava um arquivo recebido pelo multer e devolve a URL pública. */
export async function saveUpload(file) {
  const ext = ALLOWED.get(file.mimetype) || '.bin'
  const { url } = await put(file.buffer, { ext, contentType: file.mimetype })
  return url
}

/** Remove uma imagem já gravada, a partir da URL guardada no banco. */
export const removeUpload = (url) => del(url)
