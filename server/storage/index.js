/* ==========================================================================
   ARMAZENAMENTO DE IMAGENS
   Uma interface, dois drivers:
     local  -> disco (desenvolvimento)
     blob   -> Vercel Blob (produção)
   O driver é escolhido pelo ambiente (credencial de Blob presente, ou
   sempre 'blob' quando rodando na Vercel).
   Os handlers chamam sempre put()/del() e não sabem qual está ativo.

   As URLs guardadas no banco são o que o site usa: "/uploads/..." no local e
   "https://...blob.vercel-storage.com/..." em produção. Como o <img> aceita
   as duas formas, o frontend não muda.
   ========================================================================== */
import { storageDriver } from '../config.js'
import * as local from './local.js'
import * as blob from './blob.js'

/* A escolha é feita a cada chamada, não no carregamento do módulo: na Vercel
   a credencial do Blob (OIDC) só existe no contexto da requisição. */
const driverOf = () => (storageDriver() === 'blob' ? blob : local)

export const storageName = () => driverOf().name

/**
 * Grava a imagem e devolve a URL pública.
 * @param {Buffer} buffer conteúdo do arquivo
 * @param {{ext: string, contentType: string}} meta
 */
export const put = (buffer, meta) => driverOf().put(buffer, meta)

/** Remove a imagem, ignorando URLs que não pertencem ao driver atual. */
export const del = (url) => driverOf().del(url)
