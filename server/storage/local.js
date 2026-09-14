/* Armazenamento em disco — usado no desenvolvimento local.
   Os arquivos ficam em DATA_DIR/uploads e são servidos em /uploads/... */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { UPLOADS_DIR } from '../config.js'

export const name = 'local'

export async function put(buffer, { ext }) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  const filename = `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${ext}`
  await fs.promises.writeFile(path.join(UPLOADS_DIR, filename), buffer)
  return { url: `/uploads/${filename}` }
}

export async function del(url) {
  if (!url || !url.startsWith('/uploads/')) return
  const filename = url.replace('/uploads/', '')
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) return
  const target = path.join(UPLOADS_DIR, filename)
  if (!target.startsWith(UPLOADS_DIR)) return
  await fs.promises.unlink(target).catch(() => {})
}
