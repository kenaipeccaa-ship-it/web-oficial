/* ==========================================================================
   ARMAZENAMENTO DE IMAGENS
   Uma interface, dois drivers:
     local  -> disco (desenvolvimento)
     blob   -> Vercel Blob (produção)
   O driver é escolhido pelo ambiente (BLOB_READ_WRITE_TOKEN presente).
   Os handlers chamam sempre put()/del() e não sabem qual está ativo.

   As URLs guardadas no banco são o que o site usa: "/uploads/..." no local e
   "https://...blob.vercel-storage.com/..." em produção. Como o <img> aceita
   as duas formas, o frontend não muda.
   ========================================================================== */
import { STORAGE_DRIVER } from '../config.js'
import * as local from './local.js'
import * as blob from './blob.js'

const driver = STORAGE_DRIVER === 'blob' ? blob : local

export const storageName = driver.name

/**
 * Grava a imagem e devolve a URL pública.
 * @param {Buffer} buffer conteúdo do arquivo
 * @param {{ext: string, contentType: string}} meta
 */
export const put = (buffer, meta) => driver.put(buffer, meta)

/** Remove a imagem, ignorando URLs que não pertencem ao driver atual. */
export const del = (url) => driver.del(url)
