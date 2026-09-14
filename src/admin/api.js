/* ==========================================================================
   CLIENTE DA API ADMINISTRATIVA
   - A sessão viaja num cookie httpOnly: o JavaScript nunca vê o token.
   - Toda escrita manda o cabeçalho X-Admin-Request (defesa contra CSRF).
   ========================================================================== */

const BASE = '/api'

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = { Accept: 'application/json' }
  if (method !== 'GET') headers['X-Admin-Request'] = '1'
  if (body && !isForm) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    /* resposta sem corpo */
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Erro ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  /* ---- sessão ---- */
  me: () => request('/auth/me'),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/password', { method: 'POST', body: { currentPassword, newPassword } }),

  /* ---- galeria ---- */
  gallery: () => request('/admin/gallery'),
  galleryUpload: (files) => {
    const fd = new FormData()
    Array.from(files).forEach((f) => fd.append('photos', f))
    return request('/admin/gallery', { method: 'POST', body: fd, isForm: true })
  },
  galleryUpdate: (id, patch) => request(`/admin/gallery/${id}`, { method: 'PATCH', body: patch }),
  galleryReplace: (id, file) => {
    const fd = new FormData()
    fd.append('photo', file)
    return request(`/admin/gallery/${id}/file`, { method: 'PUT', body: fd, isForm: true })
  },
  galleryDelete: (id) => request(`/admin/gallery/${id}`, { method: 'DELETE' }),
  galleryReorder: (ids) => request('/admin/gallery/reorder', { method: 'POST', body: { ids } }),

  /* ---- produtos ---- */
  products: () => request('/admin/products'),
  productCreate: (data) => request('/admin/products', { method: 'POST', body: data }),
  productUpdate: (id, patch) => request(`/admin/products/${id}`, { method: 'PATCH', body: patch }),
  productImage: (id, file) => {
    const fd = new FormData()
    fd.append('image', file)
    return request(`/admin/products/${id}/image`, { method: 'PUT', body: fd, isForm: true })
  },
  productImageRemove: (id) => request(`/admin/products/${id}/image`, { method: 'DELETE' }),
  productDelete: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  productReorder: (ids) => request('/admin/products/reorder', { method: 'POST', body: { ids } }),

  /* ---- informações ---- */
  settings: () => request('/admin/settings'),
  settingsSave: (info) => request('/admin/settings', { method: 'PUT', body: info }),

  /* ---- aparência: imagem de fundo do hero ---- */
  heroImageUpload: (file) => {
    const fd = new FormData()
    fd.append('image', file)
    return request('/admin/settings/hero-image', { method: 'PUT', body: fd, isForm: true })
  },
  heroImageRemove: () => request('/admin/settings/hero-image', { method: 'DELETE' }),

  /* ---- imagens das modalidades ---- */
  modalidadeImageUpload: (id, file) => {
    const fd = new FormData()
    fd.append('image', file)
    return request(`/admin/settings/modalidade-image/${encodeURIComponent(id)}`, { method: 'PUT', body: fd, isForm: true })
  },
  modalidadeImageRemove: (id) =>
    request(`/admin/settings/modalidade-image/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
