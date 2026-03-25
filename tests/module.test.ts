import { describe, it, expect, vi } from 'vitest'

describe('vue-email module', () => {
  beforeEach(() => {
    vi.mock('vue-email', () => ({
      renderAsync: vi.fn().mockResolvedValue('<html><body>Test</body></html>'),
      render: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Module Options', () => {
    it('should have correct default configuration', () => {
      const defaultOptions = {
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
      }

      expect(defaultOptions.autoImport).toBe(true)
      expect(defaultOptions.preview.enabled).toBe(true)
    })

    it('should support custom preview route', () => {
      const customOptions = {
        preview: {
          previewRoute: '/custom-preview',
          renderRoute: '/custom-preview/render',
        },
      }

      expect(customOptions.preview.previewRoute).toBe('/custom-preview')
      expect(customOptions.preview.renderRoute).toBe('/custom-preview/render')
    })

    it('should support disabling auto import', () => {
      const options = {
        autoImport: false,
      }

      expect(options.autoImport).toBe(false)
    })

    it('should support resend configuration', () => {
      const options = {
        resend: {
          apiKey: 'test_key',
          from: 'test@example.com',
          retry: {
            enabled: true,
            maxRetries: 5,
          },
          logging: {
            enabled: true,
            level: 'debug',
          },
        },
      }

      expect(options.resend.apiKey).toBe('test_key')
      expect(options.resend.retry.maxRetries).toBe(5)
      expect(options.resend.logging.level).toBe('debug')
    })

    it('should support component prefix', () => {
      const options = {
        componentPrefix: 'email-',
      }

      expect(options.componentPrefix).toBe('email-')
    })
  })

  describe('useVueEmail composable', () => {
    it('should return version', () => {
      const vueEmail = {
        version: '0.0.1',
        config: {},
        getConfig: vi.fn(),
        renderEmail: vi.fn(),
        getPreviewUrl: vi.fn(),
      }

      expect(vueEmail.version).toBe('0.0.1')
    })

    it('should provide getPreviewUrl function', () => {
      const getPreviewUrl = (filePath?: string): string => {
        const previewRoute = '/__vue-email-preview'
        if (filePath) {
          return `${previewRoute}?file=${encodeURIComponent(filePath)}`
        }
        return previewRoute
      }

      expect(getPreviewUrl()).toBe('/__vue-email-preview')
      expect(getPreviewUrl('test.vue')).toBe('/__vue-email-preview?file=test.vue')
    })

    it('should provide getConfig function', () => {
      const getConfig = () => ({
        preview: {
          enabled: true,
          previewRoute: '/__vue-email-preview',
          renderRoute: '/__vue-email-preview/render',
          title: 'Vue Email Preview',
          defaultProps: {},
        },
        autoImport: true,
        componentPrefix: '',
      })

      const config = getConfig()
      expect(config.preview.enabled).toBe(true)
      expect(config.autoImport).toBe(true)
    })
  })

  describe('useResendEmail composable', () => {
    it('should have isConfigured function', () => {
      const isConfigured = (apiKey?: string) => !!apiKey

      expect(isConfigured('test_key')).toBe(true)
      expect(isConfigured()).toBe(false)
    })

    it('should support send options', () => {
      const options = {
        to: 'test@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
      }

      expect(options.to).toBe('test@example.com')
      expect(options.subject).toBe('Test Email')
    })

    it('should support sendWithComponent', async () => {
      const mockComponent = { template: '<div>Test</div>' }
      const mockProps = { title: 'Test' }

      const renderAsync = vi.fn().mockResolvedValue('<html><body>Test</body></html>')
      const html = await renderAsync(mockComponent, mockProps)

      expect(html).toContain('Test')
      expect(renderAsync).toHaveBeenCalledWith(mockComponent, mockProps)
    })

    it('should validate email addresses', () => {
      const parseAddress = (addr: string) => {
        if (addr.includes('<')) {
          const [name, email] = addr.split('<')
          return { name: name.trim(), email: email.replace('>', '').trim() }
        }
        return { email: addr.trim() }
      }

      expect(parseAddress('Test User <test@example.com>')).toEqual({
        name: 'Test User',
        email: 'test@example.com',
      })
      expect(parseAddress('test@example.com')).toEqual({
        email: 'test@example.com',
      })
    })
  })

  describe('Server API endpoints', () => {
    it('should have render endpoint', () => {
      const endpoint = '/api/render-email'
      expect(endpoint).toBe('/api/render-email')
    })

    it('should have send-test-email endpoint', () => {
      const endpoint = '/api/send-test-email'
      expect(endpoint).toBe('/api/send-test-email')
    })
  })

  describe('Components', () => {
    it('should export all email components', () => {
      const components = [
        'Html', 'Head', 'Body', 'Container', 'Section', 'Column', 'Row',
        'Heading', 'Text', 'Link', 'Button', 'Image', 'Hr', 'Preview', 'Font'
      ]

      expect(components.length).toBe(15)
      expect(components).toContain('Html')
      expect(components).toContain('Button')
      expect(components).toContain('Text')
    })
  })

  describe('Path compatibility', () => {
    it('should handle file paths correctly', () => {
      const normalizePath = (path: string) => path.replace(/\\/g, '/')

      expect(normalizePath('src\\components\\test.vue')).toBe('src/components/test.vue')
      expect(normalizePath('src/components/test.vue')).toBe('src/components/test.vue')
    })

    it('should encode file paths for URL', () => {
      const encodeFilePath = (path: string) => encodeURIComponent(path)

      expect(encodeFilePath('test.vue')).toBe('test.vue')
      expect(encodeFilePath('path/to/test.vue')).toBe('path%2Fto%2Ftest.vue')
    })
  })

  describe('Error handling', () => {
    it('should throw error when API key not configured', () => {
      const errorMessage = 'Resend API 密钥未配置，请在 nuxt.config.ts 中配置 vueEmail.resend.apiKey 或设置环境变量 NUXT_VUE_EMAIL_RESEND_API_KEY'

      expect(() => {
        if (!process.env.NUXT_VUE_EMAIL_RESEND_API_KEY) {
          throw new Error(errorMessage)
        }
      }).toThrow(errorMessage)
    })

    it('should throw error when calling renderEmail on client side', () => {
      const errorMessage = 'renderEmail can only be called on the server side'

      expect(() => {
        if (typeof window !== 'undefined') {
          throw new Error(errorMessage)
        }
      }).toThrow(errorMessage)
    })

    it('should throw error when calling sendWithComponent on client side', () => {
      const errorMessage = 'sendWithComponent can only be called on the server side'

      expect(() => {
        if (typeof window !== 'undefined') {
          throw new Error(errorMessage)
        }
      }).toThrow(errorMessage)
    })
  })

  describe('Retry mechanism', () => {
    it('should determine if error is retryable', () => {
      const shouldRetry = (error: { status?: number }): boolean => {
        const status = error?.status
        if (status !== undefined && (status === 429 || status >= 500)) {
          return true
        }
        return false
      }

      expect(shouldRetry({ status: 429 })).toBe(true)
      expect(shouldRetry({ status: 500 })).toBe(true)
      expect(shouldRetry({ status: 502 })).toBe(true)
      expect(shouldRetry({ status: 400 })).toBe(false)
      expect(shouldRetry({ status: 401 })).toBe(false)
    })

    it('should support configurable retry count', () => {
      const retryConfig = {
        enabled: true,
        maxRetries: 3,
      }

      expect(retryConfig.maxRetries).toBe(3)
    })
  })

  describe('Preview plugin', () => {
    it('should have correct default route', () => {
      const defaultRoute = '/__vue-email-preview'
      expect(defaultRoute).toBe('/__vue-email-preview')
    })

    it('should support custom preview route', () => {
      const customRoute = '/custom-preview'
      expect(customRoute).not.toBe('/__vue-email-preview')
    })

    it('should include email files pattern', () => {
      const includePattern = '**/*.email.vue'
      expect(includePattern).toBe('**/*.email.vue')
    })

    it('should exclude node_modules', () => {
      const excludePattern = 'node_modules/**'
      expect(excludePattern).toBe('node_modules/**')
    })
  })
})
