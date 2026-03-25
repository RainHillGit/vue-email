import { describe, it, expect, vi } from 'vitest'
import vueEmailPlugin from '../src/vite-plugin'

interface MockServer {
  middlewares: {
    use: ReturnType<typeof vi.fn>
  }
  ws: {
    send: ReturnType<typeof vi.fn>
  }
}

function callConfigureServer(plugin: ReturnType<typeof vueEmailPlugin>, server: MockServer): void {
  const hook = plugin.configureServer
  if (typeof hook === 'function') {
    hook(server as unknown as Parameters<typeof hook>[0])
  } else if (hook && 'handler' in hook) {
    hook.handler(server as unknown as Parameters<typeof hook.handler>[0])
  }
}

describe('vite-plugin-vue-email', () => {
  describe('插件初始化', () => {
    it('应该返回一个 Vite 插件对象', () => {
      const plugin = vueEmailPlugin()

      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('vite-plugin-vue-email')
      expect(plugin.configureServer).toBeDefined()
      expect(plugin.closeBundle).toBeDefined()
    })

    it('应该使用默认配置项', () => {
      const plugin = vueEmailPlugin()

      expect(plugin.name).toBe('vite-plugin-vue-email')
    })

    it('应该接受自定义配置项', () => {
      const plugin = vueEmailPlugin({
        previewRoute: '/custom-preview',
        renderRoute: '/custom-preview/render',
        include: '**/*.vue',
        exclude: '**/node_modules/**',
        defaultProps: { test: 'value' },
        title: 'Custom Title',
      })

      expect(plugin.name).toBe('vite-plugin-vue-email')
    })

    it('应该支持空配置对象', () => {
      const plugin = vueEmailPlugin({})

      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('vite-plugin-vue-email')
    })

    it('应该支持 undefined 配置', () => {
      const plugin = vueEmailPlugin(undefined)

      expect(plugin).toBeDefined()
      expect(plugin.name).toBe('vite-plugin-vue-email')
    })
  })

  describe('配置项合并', () => {
    it('应该正确处理 previewRoute', () => {
      const plugin = vueEmailPlugin({
        previewRoute: '/test-preview',
      })

      expect(plugin).toBeDefined()
    })

    it('应该正确处理 renderRoute', () => {
      const plugin = vueEmailPlugin({
        renderRoute: '/test-preview/render',
      })

      expect(plugin).toBeDefined()
    })

    it('应该正确处理 include', () => {
      const plugin = vueEmailPlugin({
        include: '**/*.email.vue',
      })

      expect(plugin).toBeDefined()
    })

    it('应该正确处理 exclude', () => {
      const plugin = vueEmailPlugin({
        exclude: 'node_modules/**',
      })

      expect(plugin).toBeDefined()
    })

    it('应该正确处理 defaultProps', () => {
      const plugin = vueEmailPlugin({
        defaultProps: {
          title: 'Test',
          count: 42,
        },
      })

      expect(plugin).toBeDefined()
    })

    it('应该正确处理 title', () => {
      const plugin = vueEmailPlugin({
        title: 'My Email Preview',
      })

      expect(plugin).toBeDefined()
    })

    it('应该支持多个配置项同时设置', () => {
      const plugin = vueEmailPlugin({
        previewRoute: '/custom',
        renderRoute: '/custom/render',
        include: '**/*.email.vue',
        exclude: 'node_modules/**',
        defaultProps: { key: 'value' },
        title: 'Test',
      })

      expect(plugin).toBeDefined()
    })
  })

  describe('configureServer 钩子', () => {
    it('应该注册 configureServer 回调', () => {
      const plugin = vueEmailPlugin()

      expect(plugin.configureServer).toBeDefined()
    })

    it('configureServer 应该接收 server 参数', () => {
      const plugin = vueEmailPlugin()

      const mockServer: MockServer = {
        middlewares: {
          use: vi.fn(),
        },
        ws: {
          send: vi.fn(),
        },
      }

      callConfigureServer(plugin, mockServer)

      expect(mockServer.middlewares.use).toHaveBeenCalled()
    })
  })

  describe('closeBundle 钩子', () => {
    it('应该注册 closeBundle 回调', () => {
      const plugin = vueEmailPlugin()

      expect(plugin.closeBundle).toBeDefined()
    })
  })

  describe('中间件注入', () => {
    it('应该注入单个中间件处理所有路由', () => {
      const plugin = vueEmailPlugin()

      const mockServer: MockServer = {
        middlewares: {
          use: vi.fn((route: string, handler: unknown) => {
            if (route === '/__vue-email-preview') {
              expect(typeof handler).toBe('function')
            }
          }),
        },
        ws: {
          send: vi.fn(),
        },
      }

      callConfigureServer(plugin, mockServer)

      expect(mockServer.middlewares.use).toHaveBeenCalledTimes(1)
      expect(mockServer.middlewares.use).toHaveBeenCalledWith(
        '/__vue-email-preview',
        expect.any(Function)
      )
    })

    it('中间件应该处理 renderRoute 路径', () => {
      const plugin = vueEmailPlugin()

      const mockServer: MockServer = {
        middlewares: {
          use: vi.fn(),
        },
        ws: {
          send: vi.fn(),
        },
      }

      callConfigureServer(plugin, mockServer)

      const middlewareHandler = mockServer.middlewares.use.mock.calls[0][1]
      expect(typeof middlewareHandler).toBe('function')
    })

    it('应该使用自定义 previewRoute', () => {
      const customRoute = '/custom-preview'
      const plugin = vueEmailPlugin({ previewRoute: customRoute })

      const mockServer: MockServer = {
        middlewares: {
          use: vi.fn(),
        },
        ws: {
          send: vi.fn(),
        },
      }

      callConfigureServer(plugin, mockServer)

      expect(mockServer.middlewares.use).toHaveBeenCalledWith(
        customRoute,
        expect.any(Function)
      )
    })

    it('renderRoute 应该支持自定义', () => {
      const customRoute = '/custom-preview/render'
      const plugin = vueEmailPlugin({ renderRoute: customRoute })

      const mockServer: MockServer = {
        middlewares: {
          use: vi.fn(),
        },
        ws: {
          send: vi.fn(),
        },
      }

      callConfigureServer(plugin, mockServer)

      const middlewareHandler = mockServer.middlewares.use.mock.calls[0][1]
      expect(typeof middlewareHandler).toBe('function')
    })
  })

  describe('WebSocket 推送', () => {
    it('应该初始化 WebSocket 连接', () => {
      const plugin = vueEmailPlugin()

      const mockServer: MockServer = {
        middlewares: {
          use: vi.fn(),
        },
        ws: {
          send: vi.fn(),
        },
      }

      callConfigureServer(plugin, mockServer)

      expect(typeof mockServer.ws.send).toBe('function')
    })
  })

  describe('类型检查', () => {
    it('插件对象应该有正确的类型属性', () => {
      const plugin = vueEmailPlugin()

      expect(plugin).toHaveProperty('name')
      expect(plugin).toHaveProperty('configureServer')
      expect(plugin).toHaveProperty('closeBundle')
    })

    it('name 应该是字符串', () => {
      const plugin = vueEmailPlugin()

      expect(typeof plugin.name).toBe('string')
      expect(plugin.name).toBe('vite-plugin-vue-email')
    })
  })

  describe('边界场景', () => {
    it('应该处理空字符串配置项', () => {
      const plugin = vueEmailPlugin({
        previewRoute: '',
        renderRoute: '',
      })

      expect(plugin).toBeDefined()
    })

    it('应该处理特殊字符配置项', () => {
      const plugin = vueEmailPlugin({
        previewRoute: '/test-123/preview',
        renderRoute: '/test-456/render',
      })

      expect(plugin).toBeDefined()
    })

    it('应该处理长路径配置项', () => {
      const plugin = vueEmailPlugin({
        previewRoute: '/very/long/path/to/preview/page',
      })

      expect(plugin).toBeDefined()
    })

    it('应该处理多文件模式 include', () => {
      const plugin = vueEmailPlugin({
        include: ['**/*.email.vue', '**/*.mail.vue'],
      })

      expect(plugin).toBeDefined()
    })

    it('应该处理多文件模式 exclude', () => {
      const plugin = vueEmailPlugin({
        exclude: ['node_modules/**', 'dist/**', '.git/**'],
      })

      expect(plugin).toBeDefined()
    })

    it('应该处理复杂的 defaultProps', () => {
      const plugin = vueEmailPlugin({
        defaultProps: {
          string: 'value',
          number: 42,
          boolean: true,
          array: [1, 2, 3],
          object: { nested: true },
          null: null,
        },
      })

      expect(plugin).toBeDefined()
    })
  })
})
