const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = process.env.PORT || 10000

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url)
  let pathname = parsedUrl.pathname
  
  // Remove trailing slash except for root
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }
  
  console.log(`${req.method} ${pathname}`)
  
  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: 'production'
    }))
    return
  }
  
  // API fallback
  if (pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: true,
      data: [],
      message: 'API not available in production mode'
    }))
    return
  }
  
  // Serve static files
  const distPath = path.join(__dirname, '..', 'dist')
  let filePath
  
  if (pathname === '/' || pathname === '') {
    filePath = path.join(distPath, 'index.html')
  } else {
    filePath = path.join(distPath, pathname)
  }
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found, serve index.html for SPA routing
      const indexPath = path.join(distPath, 'index.html')
      fs.readFile(indexPath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Application not found')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(content)
      })
      return
    }
    
    // File exists, serve it
    const ext = path.extname(filePath).toLowerCase()
    const mimeType = mimeTypes[ext] || 'application/octet-stream'
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Server Error')
        return
      }
      
      res.writeHead(200, { 'Content-Type': mimeType })
      res.end(content)
    })
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Simple Production Server running on http://0.0.0.0:${PORT}`)
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`)
  console.log(`📁 Static files: ${path.join(__dirname, '..', 'dist')}`)
})