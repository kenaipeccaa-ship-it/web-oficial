/* ==========================================================================
   PONTO DE ENTRADA
   Decide, pela URL, se carrega o SITE PÚBLICO ou o PAINEL ADMINISTRATIVO.
   Cada um tem o seu próprio bundle e o seu próprio CSS:
   - o visitante nunca baixa o código nem os estilos do painel;
   - o painel não herda o CSS do site, então os dois visuais ficam isolados.
   ========================================================================== */
const path = window.location.pathname.replace(/\/+$/, '')
const isAdmin = path === '/admin' || path.startsWith('/admin/')

const boot = isAdmin ? () => import('./admin/entry-admin.jsx') : () => import('./entry-public.jsx')

boot().catch((err) => {
  // Rede instável no carregamento do bundle: tenta de novo uma vez antes de
  // deixar a página em branco.
  console.error('Falha ao carregar a aplicação:', err)
  setTimeout(() => {
    boot().catch(() => {
      document.getElementById('root').innerHTML =
        '<p style="padding:2rem;font-family:system-ui,sans-serif;color:#f3f5f8">' +
        'Não foi possível carregar a página. Verifique a conexão e recarregue.</p>'
    })
  }, 1200)
})
