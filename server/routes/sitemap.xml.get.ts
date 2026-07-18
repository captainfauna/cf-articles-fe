export default defineEventHandler(async (event) => {
  const ARTICLE_API  = 'https://apiarticle.captainfauna.co.id/api/v1'
  const SITE_DOMAIN  = 'https://article.captainfauna.com'
  const today        = new Date().toISOString().slice(0, 10)

  // Fetch all articles
  let articles: { slug: string; published_at?: string }[] = []
  try {
    let page = 1
    while (true) {
      const data: any = await $fetch(`${ARTICLE_API}/articles?page=${page}&limit=50`)
      const items = data?.data ?? []
      articles.push(...items)
      if (page >= (data?.meta?.total_pages ?? 1)) break
      page++
    }
  } catch (e) {
    console.error('Sitemap fetch error:', e)
  }

  const urls = [
    // Homepage
    `  <url>
    <loc>${SITE_DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    // Articles
    ...articles.map(a => `  <url>
    <loc>${SITE_DOMAIN}/${a.slug}</loc>
    <lastmod>${(a.published_at ?? today).slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  ].join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return xml
})
