import { createServer } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' }
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)
  const file = path.join(root, rel)
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden') }
  try {
    const data = fs.readFileSync(file)
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404); res.end('Not found')
  }
})
server.listen(5173, '127.0.0.1', () => console.log('http://127.0.0.1:5173'))
