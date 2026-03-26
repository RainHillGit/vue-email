import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { parse as parseUrl } from 'node:url'
import chokidar from 'chokidar'
import { renderAsync } from './renderer/render'

export interface VueEmailPluginOptions {
  previewRoute?: string
  renderRoute?: string
  include?: string | string[]
  exclude?: string | string[]
  defaultProps?: Record<string, any>
  title?: string
}

export default function vueEmailPlugin(options: VueEmailPluginOptions = {}): Plugin {
  const {
    previewRoute = '/__vue-email-preview',
    renderRoute = '/__vue-email-preview/render',
    include = '**/*.email.vue',
    exclude = 'node_modules/**',
    defaultProps = {},
    title = 'Vue Email Preview',
  } = options

  let emailFiles: string[] = []
  let viteServer: any
  let root: string = process.cwd()

  const watcher = chokidar.watch(include, {
    ignored: exclude,
    ignoreInitial: false,
    cwd: root,
  })

  watcher.on('add', (filePath) => {
    if (!emailFiles.includes(filePath)) {
      emailFiles.push(filePath)
      notifyUpdate()
    }
  })

  watcher.on('unlink', (filePath) => {
    emailFiles = emailFiles.filter(f => f !== filePath)
    notifyUpdate()
  })

  function notifyUpdate() {
    if (viteServer) {
      viteServer.ws.send({
        type: 'vue-email:file-update',
        data: emailFiles,
      })
    }
  }

  function generatePreviewHTML(files: string[]): string {
    const fileList = files.map(file => {
      const name = file.replace(/\\/g, '/').replace(/\.email\.vue$/, '')
      return `{ name: '${file}', path: '${file}', componentName: '${name}' }`
    }).join(',\n      ')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .header {
      background: #2563eb;
      color: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 { font-size: 24px; font-weight: 600; }
    .header p { opacity: 0.8; margin-top: 4px; font-size: 14px; }
    .container { display: flex; min-height: calc(100vh - 80px); }
    .sidebar {
      width: 320px;
      background: white;
      border-right: 1px solid #e5e7eb;
      overflow-y: auto;
    }
    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
    }
    .file-list { list-style: none; }
    .file-item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.2s;
    }
    .file-item:hover { background: #f9fafb; }
    .file-item.active { background: #eff6ff; border-left: 3px solid #2563eb; }
    .file-name { font-weight: 500; color: #111827; font-size: 14px; }
    .file-path { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .preview-area {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }
    .toolbar-group {
      display: flex;
      gap: 4px;
      padding: 4px;
      background: #f3f4f6;
      border-radius: 8px;
    }
    .toolbar-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
      background: transparent;
      color: #374151;
    }
    .toolbar-btn:hover { background: white; }
    .toolbar-btn.active { background: #2563eb; color: white; }
    .viewport-input {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      width: 100px;
    }
    .preview-frame {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-height: 600px;
      padding: 20px;
      overflow: hidden;
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .preview-title { font-weight: 600; color: #111827; }
    .preview-content { line-height: 1.6; }
    .preview-iframe { width: 100%; min-height: 500px; border: none; background: white; transition: width 0.3s; }
    .preview-source {
      width: 100%;
      min-height: 500px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      background: #1e1e1e;
      color: #d4d4d4;
      overflow: auto;
      display: none;
    }
    .preview-source.show { display: block; }
    .preview-iframe.hidden { display: none; }
    .loading { text-align: center; padding: 40px; color: #6b7280; }
    .error { 
      background: #fef2f2; 
      border: 1px solid #fecaca; 
      color: #dc2626; 
      padding: 16px; 
      border-radius: 8px;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 13px;
    }
    .props-panel {
      margin-top: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .props-title { font-weight: 600; margin-bottom: 12px; color: #374151; display: flex; justify-content: space-between; align-items: center; }
    .props-textarea {
      width: 100%;
      min-height: 120px;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      resize: vertical;
      background: white;
    }
    .props-textarea:focus { outline: none; border-color: #2563eb; }
    .props-error { color: #dc2626; font-size: 12px; margin-top: 8px; }
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .btn-sm { padding: 4px 8px; font-size: 12px; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-secondary:hover { background: #4b5563; }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6b7280;
    }
    .empty-state svg { width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.5; }
    .email-client-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
    }
    .badge-gmail { background: #ea4335; color: white; }
    .badge-outlook { background: #0078d4; color: white; }
    .badge-apple { background: #007aff; color: white; }
    .email-client-info {
      font-size: 12px;
      color: #6b7280;
      margin-top: 8px;
      padding: 8px 12px;
      background: #fef3c7;
      border-radius: 6px;
      display: none;
    }
    .email-client-info.show { display: block; }
    .copy-toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #10b981;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s;
    }
    .copy-toast.show { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Vue Email Component Preview Tool</p>
  </div>
  
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-header">
        Email Components (<span id="file-count">${files.length}</span>)
      </div>
      <div id="file-list" class="file-list">
        ${files.length === 0 ? '<div class="empty-state">No .email.vue files found</div>' : ''}
        ${files.map(file => `
          <div class="file-item" data-path="${file}">
            <div class="file-name">${file.replace(/\\/g, '/').replace(/\.email\.vue$/, '').split('/').pop()}</div>
            <div class="file-path">${file}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="preview-area">
      <div class="toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn active" data-view="preview" onclick="setView('preview')">Preview</button>
          <button class="toolbar-btn" data-view="source" onclick="setView('source')">Source</button>
        </div>
        
        <div class="toolbar-group">
          <button class="toolbar-btn" data-client="none" onclick="setEmailClient('none')">Default</button>
          <button class="toolbar-btn" data-client="gmail" onclick="setEmailClient('gmail')">Gmail</button>
          <button class="toolbar-btn" data-client="outlook" onclick="setEmailClient('outlook')">Outlook</button>
          <button class="toolbar-btn" data-client="apple" onclick="setEmailClient('apple')">Apple Mail</button>
        </div>
        
        <div class="toolbar-group">
          <button class="toolbar-btn" data-device="mobile" onclick="setViewport(375)">Mobile</button>
          <button class="toolbar-btn" data-device="tablet" onclick="setViewport(768)">Tablet</button>
          <button class="toolbar-btn active" data-device="desktop" onclick="setViewport(1200)">Desktop</button>
          <input type="number" class="viewport-input" id="viewport-input" value="1200" min="280" max="1920" onchange="setViewport(this.value)">
        </div>
        
        <button class="btn btn-sm btn-secondary" onclick="refreshPreview()">Refresh</button>
      </div>
      
      <div class="email-client-info" id="client-info">
        <strong>Email Client Simulation:</strong> <span id="client-name">Default</span>
        <div id="client-rules"></div>
      </div>
      
      <div class="preview-frame" id="preview-frame">
        <div class="preview-header">
          <span class="preview-title" id="preview-title">Select a component</span>
        </div>
        <div id="preview-content" class="preview-content">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p>Select an email component from the sidebar to preview</p>
          </div>
        </div>
      </div>
      
      <div class="props-panel">
        <div class="props-title">
          <span>Component Props (JSON)</span>
          <div>
            <button class="btn btn-sm btn-secondary" onclick="resetProps()">Reset</button>
            <button class="btn btn-sm btn-primary" onclick="updateProps()">Apply</button>
          </div>
        </div>
        <textarea id="props-input" class="props-textarea" placeholder='{"propName": "value"}'>${JSON.stringify(defaultProps, null, 2)}</textarea>
        <div class="props-error" id="props-error"></div>
      </div>
    </div>
  </div>

  <div class="copy-toast" id="copy-toast">HTML copied to clipboard!</div>

  <script>
    window.__VUE_EMAIL_PLUGIN__ = {
      renderRoute: '${renderRoute}',
      defaultProps: ${JSON.stringify(defaultProps)},
      initialFiles: [${fileList}]
    }

    let currentView = 'preview'
    let currentClient = 'none'
    let currentViewport = 1200
    let currentFile = null
    let currentHtml = ''
    let currentProps = ${JSON.stringify(defaultProps)}

    const emailClientStyles = {
      none: {
        name: 'Default',
        rules: 'No additional styles applied.',
        css: ''
      },
      gmail: {
        name: 'Gmail',
        rules: '• Removes default link colors<br>• Forces web-safe fonts<br>• Removes Apple link styling',
        css: \`<style>
          body { font-family: Arial, sans-serif !important; }
          a { color: inherit !important; text-decoration: none !important; }
          .email-content a[href] { color: inherit !important; }
        </style>\`
      },
      outlook: {
        name: 'Outlook',
        rules: '• Forces Arial font<br>• Removes automatic link detection<br>• Word-style spacing',
        css: \`<style>
          body { font-family: Arial, sans-serif !important; }
          a { color: inherit !important; text-decoration: none !important; }
          p { margin: 0 !important; }
        </style>\`
      },
      apple: {
        name: 'Apple Mail',
        rules: '• Removes link underlines on iOS<br>• Forces Helvetica Neue<br>• Removes auto-link styling',
        css: \`<style>
          body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important; }
          a { text-decoration: none !important; }
          @media screen and (max-device-width: 768px) {
            a { -webkit-text-decoration: none !important; }
          }
        </style>\`
      }
    }

    function setView(view) {
      currentView = view
      document.querySelectorAll('[data-view]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view)
      })
      
      const iframe = document.getElementById('preview-iframe')
      const source = document.getElementById('preview-source')
      
      if (view === 'preview') {
        iframe.classList.remove('hidden')
        source.classList.remove('show')
      } else {
        iframe.classList.add('hidden')
        source.classList.add('show')
        showSourceCode()
      }
    }

    function setEmailClient(client) {
      currentClient = client
      document.querySelectorAll('[data-client]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.client === client)
      })
      
      const info = document.getElementById('client-info')
      const name = document.getElementById('client-name')
      const rules = document.getElementById('client-rules')
      
      if (client === 'none') {
        info.classList.remove('show')
      } else {
        info.classList.add('show')
        name.textContent = emailClientStyles[client].name
        rules.innerHTML = emailClientStyles[client].rules
      }
      
      if (currentFile) renderPreview()
    }

    function setViewport(width) {
      const w = parseInt(width)
      if (isNaN(w) || w < 280 || w > 1920) return
      
      currentViewport = w
      document.getElementById('viewport-input').value = w
      
      document.querySelectorAll('[data-device]').forEach(btn => {
        btn.classList.remove('active')
      })
      
      const frame = document.getElementById('preview-frame')
      frame.style.width = w + 'px'
      
      if (currentFile) renderPreview()
    }

    async function loadFiles() {
      try {
        const response = await fetch('/__vue-email-preview/files')
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
        const files = await response.json()
        
        const fileList = files.map(file => ({
          name: file.replace(/\\/g, '/').replace(/\.email\.vue/, '').split('/').pop() || '',
          path: file,
          componentName: file.replace(/\\/g, '/').replace(/\.email\.vue/, '')
        }))
        
        updateFileList(fileList)
        
        if (fileList.length > 0 && !currentFile) {
          selectFile(fileList[0])
        }
      } catch (error) {
        console.error('Failed to load files:', error)
      }
    }

    function updateFileList(files) {
      const list = document.getElementById('file-list')
      const count = document.getElementById('file-count')
      count.textContent = files.length
      
      if (files.length === 0) {
        list.innerHTML = '<div class="empty-state">No .email.vue files found</div>'
        return
      }
      
      list.innerHTML = files.map(file => \`
        <div class="file-item \${currentFile?.path === file.path ? 'active' : ''}" data-path="\${file.path}">
          <div class="file-name">\${file.name}</div>
          <div class="file-path">\${file.path}</div>
        </div>
      \`).join('')
      
      list.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
          const path = item.getAttribute('data-path')
          const file = files.find(f => f.path === path)
          if (file) selectFile(file)
        })
      })
    }

    async function selectFile(file) {
      currentFile = file
      document.querySelectorAll('.file-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-path') === file.path)
      })
      document.getElementById('preview-title').textContent = file.name
      await renderPreview()
    }

    async function renderPreview() {
      if (!currentFile) return
      
      showLoading()
      
      try {
        const url = \`\${window.location.origin}\${window.__VUE_EMAIL_PLUGIN__.renderRoute}?path=\${encodeURIComponent(currentFile.path)}&props=\${encodeURIComponent(JSON.stringify(currentProps))}\`
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || \`HTTP \${response.status}: \${response.statusText}\`)
        }
        
        currentHtml = await response.text()
        
        if (currentView === 'preview') {
          renderIframe()
        } else {
          showSourceCode()
        }
      } catch (error) {
        showError(error.message)
      }
    }

    function renderIframe() {
      const content = document.getElementById('preview-content')
      const clientCss = emailClientStyles[currentClient]?.css || ''
      
      let fullHtml = currentHtml
      if (currentHtml.includes('</head>')) {
        fullHtml = currentHtml.replace('</head>', clientCss + '</head>')
      } else if (currentHtml.includes('<html>')) {
        fullHtml = currentHtml.replace('<html>', '<html>' + clientCss)
      } else {
        fullHtml = clientCss + currentHtml
      }
      
      content.innerHTML = '<iframe id="preview-iframe" class="preview-iframe" sandbox="allow-same-origin"></iframe>'
      
      const iframe = document.getElementById('preview-iframe')
      iframe.style.width = currentViewport + 'px'
      
      setTimeout(() => {
        iframe.contentDocument.open()
        iframe.contentDocument.write(fullHtml)
        iframe.contentDocument.close()
      }, 50)
    }

    function showSourceCode() {
      const content = document.getElementById('preview-content')
      
      let formattedHtml = currentHtml
        .replace(/></g, '>\\n<')
        .replace(/(<[^>]+>)/g, (match) => {
          if (match.startsWith('</')) return match
          return match
        })
      
      const highlighted = formattedHtml
        .replace(/(&lt;/?)([a-zA-Z][a-zA-Z0-9-]*)([^&]*)(&gt;)/g,
          '<span style="color:#569cd6;">$1</span><span style="color:#4ec9b0;">$2</span><span style="color:#d4d4d4;">$3</span><span style="color:#569cd6;">$4</span>')
        .replace(/(&quot;[^&]*&quot;)/g, '<span style="color:#ce9178;">$1</span>')
      
      content.innerHTML = \`<pre class="preview-source show" id="preview-source">\${highlighted}</pre>\`
      content.innerHTML += \`<button class="btn btn-primary" onclick="copySourceCode()" style="margin-top:12px;">Copy HTML</button>\`
    }

    function copySourceCode() {
      navigator.clipboard.writeText(currentHtml).then(() => {
        showToast('HTML copied to clipboard!')
      }).catch(err => {
        console.error('Failed to copy:', err)
      })
    }

    function showToast(message) {
      const toast = document.getElementById('copy-toast')
      toast.textContent = message
      toast.classList.add('show')
      setTimeout(() => toast.classList.remove('show'), 3000)
    }

    function showLoading() {
      document.getElementById('preview-content').innerHTML = '<div class="loading">Rendering...</div>'
    }

    function showError(message) {
      document.getElementById('preview-content').innerHTML = \`<div class="error">Render Error: \${escapeHtml(message)}</div>\`
    }

    function escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    function updateProps() {
      const input = document.getElementById('props-input')
      const error = document.getElementById('props-error')
      
      try {
        currentProps = JSON.parse(input.value || '{}')
        error.textContent = ''
        if (currentFile) renderPreview()
      } catch (e) {
        error.textContent = 'Invalid JSON: ' + e.message
      }
    }

    function resetProps() {
      const input = document.getElementById('props-input')
      const error = document.getElementById('props-error')
      input.value = JSON.stringify(window.__VUE_EMAIL_PLUGIN__.defaultProps, null, 2)
      currentProps = window.__VUE_EMAIL_PLUGIN__.defaultProps
      error.textContent = ''
      if (currentFile) renderPreview()
    }

    function refreshPreview() {
      if (currentFile) renderPreview()
    }

    function connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = \`\${protocol}//\${window.location.host}\`
      
      const socket = new WebSocket(wsUrl, 'vite-hmr')
      
      socket.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          try {
            const payload = JSON.parse(event.data)
            
            if (payload.type === 'vue-email:file-update') {
              const files = payload.data.map(file => ({
                name: file.replace(/\\/g, '/').replace(/\.email\.vue/, '').split('/').pop() || '',
                path: file,
                componentName: file.replace(/\\/g, '/').replace(/\.email\.vue/, '')
              }))
              
              updateFileList(files)
              
              if (currentFile) {
                const stillExists = files.some(f => f.path === currentFile.path)
                if (stillExists) {
                  await renderPreview()
                } else {
                  currentFile = files[0] || null
                  if (currentFile) await renderPreview()
                }
              }
            }
            
            if (payload.type === 'vite:hmr' || payload.type === 'modulesUpdated') {
              console.log('HMR update received, reloading...')
              window.location.reload()
            }
          } catch (error) {
            console.error('WebSocket message parse error:', error)
          }
        }
      }

      socket.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...')
        setTimeout(connectWebSocket, 1000)
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      connectWebSocket()
      loadFiles()
    })
  </script>
</body>
</html>`
  }

  return {
    name: 'vite-plugin-vue-email',
    
    configResolved(config) {
      root = config.root || process.cwd()
    },

    configureServer(server) {
      viteServer = server

      server.middlewares.use(previewRoute, async (req, res) => {
        const url = parseUrl(req.url || '', true)
        
        if (url.pathname === previewRoute || url.pathname === previewRoute + '/') {
          res.setHeader('Content-Type', 'text/html')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(generatePreviewHTML(emailFiles))
          return
        }

        if (url.pathname === renderRoute) {
          const { path, props } = url.query
          
          if (!path || typeof path !== 'string') {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing path parameter' }))
            return
          }

          try {
            const resolvedPath = resolve(root, path)
            const component = await import(resolvedPath + '?import')
            
            const componentToRender = component.default || component[Object.keys(component)[0]]
            
            let renderProps = defaultProps
            if (props && typeof props === 'string') {
              try {
                renderProps = { ...defaultProps, ...JSON.parse(props) }
              } catch (e) {
                console.warn('Invalid props JSON:', e)
              }
            }

            const html = await renderAsync(componentToRender, renderProps)

            res.setHeader('Content-Type', 'text/html')
            res.setHeader('Cache-Control', 'no-cache')
            res.end(html)
          } catch (error: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              error: error.message,
              stack: error.stack,
            }))
          }
          return
        }

        if (url.pathname === `${previewRoute}/files`) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(JSON.stringify(emailFiles))
          return
        }

        res.statusCode = 404
        res.end('Not Found')
      })
    },

    closeBundle() {
      watcher.close()
    },
  }
}

export { vueEmailPlugin }
