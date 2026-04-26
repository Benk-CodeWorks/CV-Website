// Zips the built dist/ folder into public/template.zip so the
// "Download my site" button can fetch it, inject user settings, and
// hand the user a ready-to-deploy bundle.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const outFile = join(root, 'public', 'template.zip')

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const zip = new JSZip()
for (const file of walk(distDir)) {
  const rel = relative(distDir, file).split('\\').join('/')
  zip.file(rel, readFileSync(file))
}

const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(outFile, buf)
console.log(`Wrote ${outFile} (${(buf.length / 1024).toFixed(1)} KB)`)
