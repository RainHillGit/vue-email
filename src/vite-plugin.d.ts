import type { Plugin } from 'vite'

export interface VueEmailPluginOptions {
  previewRoute?: string
  renderRoute?: string
  include?: string | string[]
  exclude?: string | string[]
  defaultProps?: Record<string, unknown>
  title?: string
}

export default function vueEmail(options?: VueEmailPluginOptions): Plugin
