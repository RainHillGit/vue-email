import type { RenderOptions } from '../../types'

interface VueEmailConfig {
  preview: {
    enabled: boolean
    previewRoute: string
    renderRoute: string
    title: string
    defaultProps: Record<string, unknown>
  }
  autoImport: boolean
  componentPrefix: string
}

interface RuntimeConfig {
  vueEmail?: VueEmailConfig
}

declare function useRuntimeConfig<T = RuntimeConfig>(): T

export function useVueEmail() {
  const config = useRuntimeConfig<RuntimeConfig>()

  const getConfig = (): VueEmailConfig => {
    return {
      preview: config.vueEmail?.preview || {
        enabled: true,
        previewRoute: '/__vue-email-preview',
        renderRoute: '/__vue-email-preview/render',
        title: 'Vue Email Preview',
        defaultProps: {},
      },
      autoImport: config.vueEmail?.autoImport ?? true,
      componentPrefix: config.vueEmail?.componentPrefix || '',
    }
  }

  const renderEmail = async <T extends Record<string, unknown>>(
    component: any,
    props: T,
    options?: RenderOptions
  ): Promise<string> => {
    if (typeof window !== 'undefined') {
      throw new Error('renderEmail can only be called on the server side')
    }

    const { renderAsync } = await import('../../renderer/render')
    return renderAsync(component, props, options)
  }

  const getPreviewUrl = (filePath?: string): string => {
    const cfg = getConfig()
    if (!cfg.preview.enabled) {
      return ''
    }
    if (filePath) {
      return `${cfg.preview.previewRoute}?file=${encodeURIComponent(filePath)}`
    }
    return cfg.preview.previewRoute
  }

  return {
    version: '0.0.1',
    config: getConfig(),
    getConfig,
    renderEmail,
    getPreviewUrl,
  }
}
