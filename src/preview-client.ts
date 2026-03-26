import { reactive as vueReactive } from 'vue'

interface EmailFile {
  name: string
  path: string
  componentName: string
}

interface PreviewState {
  files: EmailFile[]
  currentFile: EmailFile | null
  html: string
  loading: boolean
  error: string | null
  props: Record<string, any>
}

const state = reactive<PreviewState>({
  files: [],
  currentFile: null,
  html: '',
  loading: false,
  error: null,
  props: {},
})

function reactive<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, key) {
      return target[key as keyof T]
    },
    set(target, key, value) {
      target[key as keyof T] = value
      updateUI()
      return true
    },
  })
}

async function loadFiles() {
  try {
    const response = await fetch('/__vue-email-preview/files')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const files: string[] = await response.json()
    state.files = files.map(file => ({
      name: file.replace(/\\/g, '/').replace(/\.email\.vue$/, '').split('/').pop() || '',
      path: file,
      componentName: file.replace(/\\/g, '/').replace(/\.email\.vue$/, ''),
    }))
    if (state.files.length > 0 && !state.currentFile) {
      selectFile(state.files[0])
    }
  } catch (error: any) {
    console.error('Failed to load files:', error)
    state.error = `Failed to load files: ${error.message}`
  }
}

async function selectFile(file: EmailFile) {
  if (state.currentFile?.path === file.path) return
  
  state.currentFile = file
  state.loading = true
  state.error = null
  await renderPreview()
}

async function renderPreview() {
  if (!state.currentFile) return

  state.loading = true
  state.error = null

  try {
    const url = `/__vue-email-preview/render?path=${encodeURIComponent(state.currentFile.path)}&props=${encodeURIComponent(JSON.stringify(state.props))}`
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    state.html = html
    state.loading = false
    
    setTimeout(() => {
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement
      if (iframe && iframe.contentDocument) {
        iframe.contentDocument.open()
        iframe.contentDocument.write(html)
        iframe.contentDocument.close()
      }
    }, 50)
  } catch (error: any) {
    console.error('Render error:', error)
    state.error = error.message
    state.loading = false
    state.html = ''
  }
}

function updateProps(newProps: Record<string, any>) {
  state.props = newProps
  if (state.currentFile) {
    renderPreview()
  }
}

function refreshPreview() {
  if (state.currentFile) {
    renderPreview()
  }
}

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}`
  
  const socket = new WebSocket(wsUrl, 'vite-hmr')
  
  socket.onmessage = async (event) => {
    if (typeof event.data === 'string') {
      try {
        const payload = JSON.parse(event.data)
        
        if (payload.type === 'vue-email:file-update') {
          state.files = payload.data.map((file: string) => ({
            name: file.replace(/\\/g, '/').replace(/\.email\.vue$/, '').split('/').pop() || '',
            path: file,
            componentName: file.replace(/\\/g, '/').replace(/\.email\.vue$/, ''),
          }))
          
          if (state.currentFile) {
            const stillExists = state.files.some(f => f.path === state.currentFile!.path)
            if (stillExists) {
              await renderPreview()
            } else {
              state.currentFile = state.files[0] || null
              if (state.currentFile) {
                await renderPreview()
              }
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

function updateUI() {
  const fileList = document.getElementById('file-list')
  if (fileList) {
    fileList.innerHTML = state.files.length === 0
      ? '<div class="empty-state">No .email.vue files found</div>'
      : state.files.map(file => `
        <div class="file-item ${state.currentFile?.path === file.path ? 'active' : ''}" data-path="${file.path}">
          <div class="file-name">${file.name}</div>
          <div class="file-path">${file.path}</div>
        </div>
      `).join('')
    
    fileList.querySelectorAll('.file-item').forEach(item => {
      item.addEventListener('click', () => {
        const path = item.getAttribute('data-path')
        const file = state.files.find(f => f.path === path)
        if (file) selectFile(file)
      })
    })
  }

  const previewContent = document.getElementById('preview-content')
  if (previewContent) {
    if (state.loading) {
      previewContent.innerHTML = '<div class="loading">Rendering...</div>'
    } else if (state.error) {
      previewContent.innerHTML = `<div class="error">Render Error: ${escapeHtml(state.error)}</div>`
    } else if (state.html) {
      previewContent.innerHTML = '<iframe id="preview-iframe" class="preview-iframe" sandbox="allow-same-origin"></iframe>'
      setTimeout(() => {
        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement
        if (iframe && iframe.contentDocument) {
          iframe.contentDocument.open()
          iframe.contentDocument.write(state.html)
          iframe.contentDocument.close()
        }
      }, 50)
    } else {
      previewContent.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p>Select an email component from the sidebar to preview</p>
        </div>
      `
    }
  }

  const previewTitle = document.getElementById('preview-title')
  if (previewTitle) {
    previewTitle.textContent = state.currentFile?.name || 'Select a component'
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function initApp() {
  const app = document.getElementById('app')
  if (!app) return

  app.innerHTML = `
    <div class="header">
      <h1>Vue Email Preview</h1>
      <p>Vue Email Component Preview Tool</p>
    </div>
    
    <div class="container">
      <div class="sidebar">
        <div class="sidebar-header">
          Email Components (<span id="file-count">0</span>)
        </div>
        <div id="file-list" class="file-list"></div>
      </div>
      
      <div class="preview-area">
        <div class="preview-frame">
          <div class="preview-header">
            <span class="preview-title" id="preview-title">Select a component</span>
            <div class="preview-actions">
              <button class="btn" onclick="window.refreshPreview()">Refresh</button>
            </div>
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
          <div class="props-title">Component Props (JSON)</div>
          <textarea id="props-input" class="props-textarea" placeholder='{"propName": "value"}'>{}</textarea>
          <button class="btn btn-primary" onclick="window.updateProps()">Update Props</button>
        </div>
      </div>
    </div>
  `

  ;(window as any).refreshPreview = refreshPreview
  ;(window as any).updateProps = () => {
    try {
      const propsInput = document.getElementById('props-input') as HTMLTextAreaElement
      const newProps = JSON.parse(propsInput.value || '{}')
      updateProps(newProps)
    } catch (error: any) {
      alert('Invalid JSON: ' + error.message)
    }
  }

  connectWebSocket()
  loadFiles()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
