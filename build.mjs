import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
fs.rmSync(dist, { recursive: true, force: true })
fs.mkdirSync(dist, { recursive: true })

const copy = (src, dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

copy(path.join(root, 'index.html'), path.join(dist, 'index.html'))
copy(path.join(root, 'src', 'main.js'), path.join(dist, 'main.js'))
copy(path.join(root, 'src', 'styles.css'), path.join(dist, 'styles.css'))
if (fs.existsSync(path.join(root, 'public'))) {
  fs.cpSync(path.join(root, 'public'), path.join(dist, 'public'), { recursive: true })
}
console.log('✓ Build complete → dist/')
