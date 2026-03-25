import type { Component, VNode } from 'vue'

export interface RenderOptions {
  pretty?: boolean
  plainText?: boolean
  injectDoctype?: boolean
  doctype?: string
  enableMsoConditionals?: boolean
  disableCssInlining?: boolean
  timeout?: number
}

export interface RenderErrorDetails {
  component?: string
  props?: Record<string, any>
  originalError?: Error
  step?: 'vue_render' | 'html_process' | 'final_render'
  options?: RenderOptions
}

export type ComponentInput = Component | (() => VNode) | VNode
