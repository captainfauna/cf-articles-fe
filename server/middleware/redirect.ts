export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Skip internal Nuxt routes and assets
  if (pathname.startsWith('/_nuxt') || pathname.startsWith('/__nuxt') || pathname.startsWith('/api')) {
    return
  }

  // Redirect all traffic to captainfauna.com/artikel
  let newPath: string
  if (pathname === '/' || pathname === '') {
    newPath = 'https://captainfauna.com/artikel'
  } else {
    newPath = `https://captainfauna.com/artikel${pathname}`
  }

  return sendRedirect(event, newPath, 301)
})
