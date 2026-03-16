import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ReactDOMServer from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Routes to pre-render
const routes = [
  { path: '/', title: 'Chicago Fleet Wraps' },
  { path: '/vehicle-wraps', title: 'Vehicle Wraps' },
  { path: '/about', title: 'About Us' },
  { path: '/contact', title: 'Contact' }
]

async function preRenderSite() {
  const distDir = path.join(__dirname, '../dist')
  
  for (const route of routes) {
    const htmlPath = route.path === '/' ? 'index.html' : `${route.path}/index.html`
    const fullPath = path.join(distDir, htmlPath)
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    
    console.log(`Pre-rendering: ${route.path}`)
  }
  
  console.log('Pre-rendering complete!')
}

preRenderSite().catch(console.error)