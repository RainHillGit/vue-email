import { defineNuxtModule, addComponent, addImports, addVitePlugin, createResolver } from '@nuxt/kit'
import type { VueEmailPluginOptions } from './vite-plugin'
import vueEmailPlugin from './vite-plugin'

export interface ModuleOptions {
  autoImport?: boolean
  preview?: {
    enabled?: boolean
    previewRoute?: string
    renderRoute?: string
    title?: string
    defaultProps?: Record<string, unknown>
  }
  resend?: {
    apiKey?: string
    from?: string
    retry?: {
      enabled?: boolean
      maxRetries?: number
    }
    logging?: {
      enabled?: boolean
      level?: 'error' | 'warn' | 'info' | 'debug'
    }
  }
  componentPrefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-vue-email',
    configKey: 'vueEmail',
    compatibility: {
      nuxt: '^3.10.0',
    },
  },
  defaults: {
    autoImport: true,
    componentPrefix: '',
    preview: {
      enabled: true,
      previewRoute: '/__vue-email-preview',
      renderRoute: '/__vue-email-preview/render',
      title: 'Vue Email Preview',
      defaultProps: {},
    },
    resend: {
      retry: {
        enabled: true,
        maxRetries: 3,
      },
      logging: {
        enabled: false,
        level: 'error',
      },
    },
  },
  setup(options: ModuleOptions, nuxt: any) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    const components = [
      'Html', 'Head', 'Body', 'Container', 'Section', 'Column', 'Row',
      'Heading', 'Text', 'Link', 'Button', 'Image', 'Hr', 'Preview', 'Font'
    ]

    if (options.autoImport !== false) {
      for (const component of components) {
        addComponent({
          name: component,
          export: component,
          filePath: resolver.resolve(runtimeDir, 'components'),
        })
      }

      addImports([
        { name: 'render', from: 'vue-email' },
        { name: 'renderAsync', from: 'vue-email' },
        { name: 'useVueEmail', from: resolver.resolve(runtimeDir, 'composables/useVueEmail') },
        { name: 'useResendEmail', from: resolver.resolve(runtimeDir, 'composables/useResendEmail') },
      ])
    }

    if (options.preview?.enabled !== false) {
      const vitePluginOptions: VueEmailPluginOptions = {
        previewRoute: options.preview?.previewRoute || '/__vue-email-preview',
        renderRoute: options.preview?.renderRoute || '/__vue-email-preview/render',
        include: '**/*.email.vue',
        exclude: 'node_modules/**',
        title: options.preview?.title || 'Vue Email Preview',
        defaultProps: options.preview?.defaultProps || {},
      }

      addVitePlugin(vueEmailPlugin(vitePluginOptions))
    }

    nuxt.hooks.hook('prepare:types', (ctx: any) => {
      ctx.references.push({ type: 'inline', path: resolver.resolve(runtimeDir, 'types') })
    })
  },
})
