/**
 * 为 GitHub Pages 根目录生成 index.html
 * 自动扫描 packages/*/dist/index.html，列出所有可用的组件 demo
 */
import { existsSync, readdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')
const deployDir = resolve(root, '_deploy')
const packagesDir = resolve(root, 'packages')

const modules = []

for (const pkg of readdirSync(packagesDir)) {
  const pkgDistIndex = resolve(deployDir, pkg, 'index.html')
  if (existsSync(pkgDistIndex)) {
    // 读取 package.json 获取描述
    let desc = ''
    try {
      const pkgJson = JSON.parse(
        readFileSync(resolve(packagesDir, pkg, 'package.json'), 'utf-8')
      )
      desc = pkgJson.description || ''
    } catch { /* 忽略 */ }
    modules.push({ name: pkg, path: pkg, desc })
  }
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UFO 组件库 — 在线演示</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #edf1f5;
      color: #2c3e50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px 20px;
    }
    h1 { font-size: 28px; margin-bottom: 6px; }
    .subtitle { color: #6b7d8e; font-size: 14px; margin-bottom: 32px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; width: 100%; max-width: 720px; }
    .card {
      background: #fff;
      border: 1px solid #dfe3e8;
      border-radius: 12px;
      padding: 20px 24px;
      transition: box-shadow .15s, transform .12s;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); transform: translateY(-2px); }
    .card .name { font-size: 16px; font-weight: 600; }
    .card .desc { font-size: 12px; color: #6b7d8e; line-height: 1.5; }
    .card .badge { align-self: flex-start; font-size: 10px; background: #4285f4; color: #fff; padding: 2px 10px; border-radius: 10px; margin-top: 4px; }
    .empty { color: #8d9ba9; font-size: 14px; text-align: center; padding: 40px; }
  </style>
</head>
<body>
  <h1>🛸 UFO 组件库</h1>
  <p class="subtitle">基于 Custom Elements v1 的原生 Web 组件库 &middot; 在线演示</p>
  ${modules.length > 0
    ? `<div class="cards">${modules.map(m => `
    <a class="card" href="${m.path}/">
      <span class="name">${m.name}</span>
      ${m.desc ? `<span class="desc">${m.desc}</span>` : ''}
      <span class="badge">&#9654; 查看演示</span>
    </a>`).join('')}</div>`
    : '<p class="empty">暂无可用的组件演示</p>'}
</body>
</html>`

writeFileSync(resolve(deployDir, 'index.html'), html, 'utf-8')
console.log(`✓ 已生成根索引，包含 ${modules.length} 个模块`)
