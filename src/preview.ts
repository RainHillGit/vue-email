import type { RenderOptions } from './types'

export interface PreviewOptions {
  title?: string
  defaultProps?: Record<string, unknown>
  renderRoute?: string
}

export interface EmailClient {
  name: string
  rules: string
  css: string
}

export const EMAIL_CLIENTS: Record<string, EmailClient> = {
  none: {
    name: 'Default',
    rules: 'No additional styles applied.',
    css: '',
  },
  gmail: {
    name: 'Gmail',
    rules: '• Removes default link colors<br>• Forces web-safe fonts<br>• Removes Apple link styling',
    css: `<style>
      body { font-family: Arial, sans-serif !important; }
      a { color: inherit !important; text-decoration: none !important; }
      .email-content a[href] { color: inherit !important; }
    </style>`,
  },
  outlook: {
    name: 'Outlook',
    rules: '• Forces Arial font<br>• Removes automatic link detection<br>• Word-style spacing',
    css: `<style>
      body { font-family: Arial, sans-serif !important; }
      a { color: inherit !important; text-decoration: none !important; }
      p { margin: 0 !important; }
    </style>`,
  },
  apple: {
    name: 'Apple Mail',
    rules: '• Removes link underlines on iOS<br>• Forces Helvetica Neue<br>• Removes auto-link styling',
    css: `<style>
      body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important; }
      a { text-decoration: none !important; }
      @media screen and (max-device-width: 768px) {
        a { -webkit-text-decoration: none !important; }
      }
    </style>`,
  },
}

export function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, '/')
}

export function extractComponentName(filePath: string): string {
  const normalized = normalizeFilePath(filePath)
  return normalized.replace(/\.email\.vue$/, '').split('/').pop() || ''
}

export function extractFilePath(filePath: string): string {
  return normalizeFilePath(filePath).replace(/\.email\.vue$/, '')
}

export interface FileInfo {
  name: string
  path: string
  componentName: string
}

export function processFileList(files: string[]): FileInfo[] {
  return files.map(file => ({
    name: extractComponentName(file),
    path: file,
    componentName: extractFilePath(file),
  }))
}

export function generatePreviewConfig(options: PreviewOptions = {}): Record<string, unknown> {
  const {
    title = 'Vue Email Preview',
    defaultProps = {},
    renderRoute = '/__vue-email-preview/render',
  } = options

  return {
    title,
    defaultProps,
    renderRoute,
  }
}

export { renderAsync } from './renderer/render'
export type { RenderOptions }
