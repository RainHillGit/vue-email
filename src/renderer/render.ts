import { createApp, h, defineComponent } from 'vue'
import { renderToString } from '@vue/server-renderer'
import type { Component, VNode } from 'vue'
import type { 
  ComponentInput, 
  RenderOptions, 
  RenderErrorDetails
} from '../types'

type ErrorCode = 
  | 'SYNC_NOT_SUPPORTED'
  | 'VUE_RENDER_ERROR'
  | 'HTML_PROCESS_ERROR'
  | 'RENDER_TIMEOUT'
  | 'INVALID_OPTIONS'
  | 'COMPONENT_NOT_FOUND'

export class RenderError extends Error {
  code: ErrorCode
  details?: RenderErrorDetails

  constructor(message: string, code: ErrorCode, details?: RenderErrorDetails) {
    super(message)
    this.name = 'RenderError'
    this.code = code
    this.details = details
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMessage: string,
  errorCode: ErrorCode,
  details?: RenderErrorDetails
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new RenderError(errorMessage, errorCode, details))
    }, timeout)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    return result
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

async function vueToHtml(
  component: any,
  props?: Record<string, any>
): Promise<string> {
  try {
    const WrapperComponent = defineComponent({
      setup() {
        return () => {
          if (typeof component === 'function') {
            const comp = component as () => VNode
            return comp()
          }
          return h(component as Component, props || {})
        }
      },
    })

    const app = createApp(WrapperComponent)
    const html = await renderToString(app)

    return cleanVueHtml(html)
  } catch (error) {
    throw new RenderError(
      `组件渲染失败: ${(error as Error).message}`,
      'VUE_RENDER_ERROR',
      { 
        originalError: error as Error, 
        step: 'vue_render',
        component: String(component)
      }
    )
  }
}

function cleanVueHtml(html: string): string {
  return html
    .replace(/\sdata-v-\w+="[^"]*"/g, '')
    .replace(/\sdata-server-rendered="true"/g, '')
}

function htmlToPlainText(html: string): string {
  let text = html
  
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<p[^>]*>/gi, '\n')
  text = text.replace(/<\/p>/gi, '\n')
  text = text.replace(/<div[^>]*>/gi, '\n')
  text = text.replace(/<\/div>/gi, '\n')
  text = text.replace(/<h[1-6][^>]*>/gi, '\n')
  text = text.replace(/<\/h[1-6]>/gi, '\n')
  text = text.replace(/<li[^>]*>/gi, '\n• ')
  text = text.replace(/<\/li>/gi, '')
  text = text.replace(/<[^>]+>/g, '')
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/\n{3,}/g, '\n\n')
  text = text.trim()
  
  return text
}

function prettyHtml(html: string): string {
  let formatted = ''
  let indentLevel = 0
  const indentSize = 2
  const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link']
  
  const tokens = html.split(/(<[^>]+>)/g).filter(token => token.trim() !== '')
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    
    if (token.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1)
      formatted += ' '.repeat(indentLevel * indentSize) + token + '\n'
    } else if (token.startsWith('<')) {
      const tagName = token.match(/<\/?([a-zA-Z0-9-]+)/)?.[1]?.toLowerCase()
      
      if (selfClosingTags.includes(tagName || '')) {
        formatted += ' '.repeat(indentLevel * indentSize) + token + '\n'
      } else {
        formatted += ' '.repeat(indentLevel * indentSize) + token + '\n'
        if (!token.endsWith('/>')) {
          indentLevel++
        }
      }
    } else {
      const text = token.trim()
      if (text) {
        formatted += ' '.repeat(indentLevel * indentSize) + text + '\n'
      }
    }
  }
  
  return formatted.trim()
}

export function render(
  component: ComponentInput,
  props?: Record<string, any>,
  _options?: RenderOptions
): string {
  throw new RenderError(
    '不支持同步渲染，请使用 renderAsync',
    'SYNC_NOT_SUPPORTED',
    { component: String(component), props }
  )
}

export async function renderAsync(
  component: ComponentInput,
  props?: Record<string, any>,
  options?: RenderOptions
): Promise<string> {
  if (!component) {
    throw new RenderError(
      '组件未找到或无效',
      'COMPONENT_NOT_FOUND',
      { component: String(component) }
    )
  }

  if (options?.timeout !== undefined && (typeof options.timeout !== 'number' || options.timeout <= 0)) {
    throw new RenderError(
      '无效的超时选项，必须是正整数',
      'INVALID_OPTIONS',
      { options }
    )
  }

  const renderPromise = (async () => {
    let html = await vueToHtml(component, props)

    if (options?.plainText) {
      try {
        html = htmlToPlainText(html)
      } catch (error) {
        throw new RenderError(
          `HTML转纯文本失败: ${(error as Error).message}`,
          'HTML_PROCESS_ERROR',
          { 
            originalError: error as Error, 
            step: 'html_process' 
          }
        )
      }
    } else if (options?.pretty) {
      try {
        html = prettyHtml(html)
      } catch (error) {
        throw new RenderError(
          `HTML美化失败: ${(error as Error).message}`,
          'HTML_PROCESS_ERROR',
          { 
            originalError: error as Error, 
            step: 'html_process' 
          }
        )
      }
    }

    if (!options?.plainText && options?.injectDoctype !== false) {
      const doctype = options?.doctype || 
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
      html = doctype + '\n' + html
    }

    return html
  })()

  if (options?.timeout) {
    return await withTimeout(
      renderPromise,
      options.timeout,
      `渲染超时，超过 ${options.timeout}ms`,
      'RENDER_TIMEOUT',
      { component: String(component), props }
    )
  }

  return await renderPromise
}
