import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { renderAsync, render, RenderError } from '../src'

const SimpleComponent = defineComponent({
  setup() {
    return () => h('div', 'Hello World')
  },
})

const TestComponent = defineComponent({
  props: {
    title: String,
    name: String,
  },
  setup(props) {
    return () => h('div', { class: 'test-email' }, [
      h('h1', props.title),
      h('p', `Hello, ${props.name}!`),
    ])
  },
})

const AsyncComponent = defineComponent({
  props: {
    delay: {
      type: Number,
      default: 100,
    },
  },
  async setup(props) {
    const data = ref('Loading...')
    
    await new Promise(resolve => setTimeout(resolve, props.delay))
    data.value = 'Async Data Loaded'
    
    return () => h('div', data.value)
  },
})

const ErrorComponent = defineComponent({
  setup() {
    throw new Error('Intentional component error')
  },
})

const SlotComponent = defineComponent({
  setup(_, { slots }) {
    return () => h('div', { class: 'slot-wrapper' }, [
      slots.default ? slots.default() : h('span', 'No content'),
    ])
  },
})

const NamedSlotComponent = defineComponent({
  setup(_, { slots }) {
    return () => h('div', { class: 'named-slot-wrapper' }, [
      h('header', slots.header ? slots.header() : null),
      h('main', slots.default ? slots.default() : null),
      h('footer', slots.footer ? slots.footer() : null),
    ])
  },
})

const EmptyPropsComponent = defineComponent({
  props: {
    requiredProp: String,
    optionalProp: {
      type: String,
      default: 'Default Value',
    },
  },
  setup(props) {
    return () => h('div', [
      h('p', `Required: ${props.requiredProp || 'Missing'}`),
      h('p', `Optional: ${props.optionalProp}`),
    ])
  },
})

describe('renderAsync', () => {
  describe('基础功能', () => {
    it('应该能够渲染简单组件', async () => {
      const html = await renderAsync(SimpleComponent)
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).toContain('<!DOCTYPE html')
      expect(html).toContain('Hello World')
    })

    it('应该能够正确传递 props', async () => {
      const html = await renderAsync(TestComponent, {
        title: 'Welcome',
        name: 'John',
      })
      expect(html).toContain('Welcome')
      expect(html).toContain('Hello, John!')
    })

    it('应该支持函数式组件', async () => {
      const FunctionComponent = () => h('div', 'Function Component')
      const html = await renderAsync(FunctionComponent)
      expect(html).toContain('Function Component')
    })
  })

  describe('插槽渲染', () => {
    it('应该渲染默认插槽', async () => {
      const SlotContent = defineComponent({
        setup() {
          return () => h(SlotComponent, null, {
            default: () => h('span', 'Slot Content'),
          })
        },
      })
      
      const html = await renderAsync(SlotContent)
      expect(html).toContain('Slot Content')
      expect(html).toContain('slot-wrapper')
    })

    it('应该渲染命名插槽', async () => {
      const NamedSlotContent = defineComponent({
        setup() {
          return () => h(NamedSlotComponent, null, {
            header: () => h('h1', 'Header Slot'),
            default: () => h('p', 'Main Content'),
            footer: () => h('small', 'Footer Slot'),
          })
        },
      })
      
      const html = await renderAsync(NamedSlotContent)
      expect(html).toContain('Header Slot')
      expect(html).toContain('Main Content')
      expect(html).toContain('Footer Slot')
    })

    it('应该处理空插槽', async () => {
      const html = await renderAsync(SlotComponent)
      expect(html).toContain('No content')
    })
  })

  describe('边界场景', () => {
    it('应该处理空 props', async () => {
      const html = await renderAsync(EmptyPropsComponent, {
        requiredProp: 'Provided',
      })
      expect(html).toContain('Required: Provided')
      expect(html).toContain('Optional: Default Value')
    })

    it('应该处理部分缺失的 props', async () => {
      const html = await renderAsync(EmptyPropsComponent, {
        optionalProp: 'Custom Value',
      })
      expect(html).toContain('Required: Missing')
      expect(html).toContain('Optional: Custom Value')
    })

    it.skip('应该处理异步组件抛出错误', async () => {
      const AsyncErrorComponent = defineComponent({
        async setup() {
          await new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Async component error')), 50)
          )
          return () => h('div', 'Never rendered')
        },
      })

      await expect(
        renderAsync(AsyncErrorComponent)
      ).rejects.toThrow(RenderError)
    })
  })

  describe('异步组件支持', () => {
    it('应该能够等待异步 setup 完成', async () => {
      const html = await renderAsync(AsyncComponent, { delay: 50 })
      expect(html).toContain('Async Data Loaded')
      expect(html).not.toContain('Loading...')
    })

    it('应该能够处理超时', async () => {
      const SlowComponent = defineComponent({
        async setup() {
          await new Promise(resolve => setTimeout(resolve, 1000))
          return () => h('div', 'Never rendered')
        },
      })

      await expect(
        renderAsync(SlowComponent, {}, { timeout: 100 })
      ).rejects.toThrow(RenderError)
      
      await expect(
        renderAsync(SlowComponent, {}, { timeout: 100 })
      ).rejects.toThrow('渲染超时')
    })
  })

  describe('渲染选项', () => {
    it('应该支持自定义 doctype', async () => {
      const html = await renderAsync(SimpleComponent, {}, {
        doctype: '<!DOCTYPE html>',
      })
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).not.toContain('XHTML 1.0 Transitional')
    })

    it('应该支持禁用 doctype 注入', async () => {
      const html = await renderAsync(SimpleComponent, {}, {
        injectDoctype: false,
      })
      expect(html).not.toContain('<!DOCTYPE')
    })

    it('应该支持纯文本渲染', async () => {
      const html = await renderAsync(TestComponent, {
        title: 'Welcome',
        name: 'John',
      }, {
        plainText: true,
      })
      
      expect(html).not.toContain('<div')
      expect(html).not.toContain('</div>')
      expect(html).toContain('Welcome')
      expect(html).toContain('Hello, John!')
    })

    it('应该支持 HTML 美化格式', async () => {
      const html = await renderAsync(TestComponent, {
        title: 'Welcome',
        name: 'John',
      }, {
        pretty: true,
      })
      
      expect(html).toContain('\n')
      expect(html.split('\n').length).toBeGreaterThan(3)
    })

    it('应该验证无效的超时选项', async () => {
      await expect(
        renderAsync(SimpleComponent, {}, { timeout: -1 })
      ).rejects.toThrow(RenderError)
      
      await expect(
        renderAsync(SimpleComponent, {}, { timeout: 0 })
      ).rejects.toThrow(RenderError)
    })
  })

  describe('错误处理', () => {
    it('同步 render 应该抛出不支持错误', () => {
      expect(() => {
        render(SimpleComponent)
      }).toThrow(RenderError)
      
      expect(() => {
        render(SimpleComponent)
      }).toThrow('不支持同步渲染')
    })

    it('应该捕获组件渲染错误', async () => {
      await expect(
        renderAsync(ErrorComponent)
      ).rejects.toThrow(RenderError)
      
      await expect(
        renderAsync(ErrorComponent)
      ).rejects.toThrow('组件渲染失败')
    })

    it('应该提供详细的错误信息', async () => {
      try {
        await renderAsync(ErrorComponent)
      } catch (error) {
        expect(error).toBeInstanceOf(RenderError)
        const renderError = error as RenderError
        expect(renderError.code).toBe('VUE_RENDER_ERROR')
        expect(renderError.details).toBeDefined()
        expect(renderError.details?.step).toBe('vue_render')
        expect(renderError.details?.originalError).toBeDefined()
      }
    })

    it('应该处理 null/undefined 组件', async () => {
      await expect(
        // @ts-ignore - 测试无效输入
        renderAsync(null)
      ).rejects.toThrow(RenderError)
      
      await expect(
        // @ts-ignore - 测试无效输入
        renderAsync(undefined)
      ).rejects.toThrow('组件未找到')
    })
  })

  describe('错误码验证', () => {
    const errorCodes = [
      'SYNC_NOT_SUPPORTED',
      'VUE_RENDER_ERROR',
      'HTML_PROCESS_ERROR',
      'RENDER_TIMEOUT',
      'INVALID_OPTIONS',
      'COMPONENT_NOT_FOUND',
    ]

    errorCodes.forEach(code => {
      it(`应该包含错误码: ${code}`, async () => {
        const error = new RenderError('Test', code as any)
        expect(error.code).toBe(code)
      })
    })
  })
})
