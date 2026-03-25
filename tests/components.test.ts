import { describe, it, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { renderAsync } from '../src'
import { Html, Head, Body, Preview } from '../src/components'

describe('邮件布局基础组件', () => {
  describe('Html 组件', () => {
    it('应该渲染基本的 html 标签', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => h('div', 'Content'),
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
      expect(html).toContain('<div>Content</div>')
    })

    it('应该支持 lang 属性', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, { lang: 'zh-CN' }, {
            default: () => h('div', 'Content'),
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('lang="zh-CN"')
    })

    it('应该支持 dir 属性', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, { lang: 'ar', dir: 'rtl' }, {
            default: () => h('div', 'Content'),
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('dir="rtl"')
    })
  })

  describe('Head 组件', () => {
    it('应该渲染 head 标签', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head, null, {
                default: () => h('title', 'Test Title'),
              }),
              h('body', null, 'Content'),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('<head>')
      expect(html).toContain('</head>')
      expect(html).toContain('<title>Test Title</title>')
    })

    it('应该支持 title prop', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head, { title: 'My Email Title' }),
              h('body', null, 'Content'),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('<title>My Email Title</title>')
    })

    it('应该支持嵌套 meta 标签', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head, null, {
                default: () => [
                  h('meta', { name: 'viewport', content: 'width=device-width' }),
                  h('meta', { charset: 'UTF-8' }),
                ],
              }),
              h('body', null, 'Content'),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('name="viewport"')
      expect(html).toContain('charset="UTF-8"')
    })
  })

  describe('Preview 组件', () => {
    it('应该渲染预览文本', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head, null, {
                default: () => h(Preview, { children: '这是预览文本' }),
              }),
              h('body', null, '正文内容'),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('这是预览文本')
      expect(html).toContain('data-preview="true"')
    })

    it('应该使用合规的隐藏样式', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head, null, {
                default: () => h(Preview, { children: 'Preview' }),
              }),
              h('body', null, 'Content'),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('display:none')
      expect(html).toContain('mso-hide')
    })
  })

  describe('Body 组件', () => {
    it('应该渲染 body 标签', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head),
              h(Body, null, {
                default: () => h('div', 'Email Content'),
              }),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('<body')
      expect(html).toContain('</body>')
      expect(html).toContain('<div>Email Content</div>')
    })

    it('应该内置样式重置', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head),
              h(Body, null, {
                default: () => h('div', 'Content'),
              }),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('margin:0')
      expect(html).toContain('padding:0')
    })

    it('应该支持 backgroundColor', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head),
              h(Body, { backgroundColor: '#f0f0f0' }, {
                default: () => h('div', 'Content'),
              }),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('background-color:#f0f0f0')
    })

    it('应该支持 bgcolor 别名', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, null, {
            default: () => [
              h(Head),
              h(Body, { bgcolor: '#cccccc' }, {
                default: () => h('div', 'Content'),
              }),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('background-color:#cccccc')
    })
  })

  describe('组件嵌套使用', () => {
    it('应该支持 Html > Head > Title 结构', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, { lang: 'en' }, {
            default: () => [
              h(Head, { title: 'Welcome Email' }),
              h(Body, null, {
                default: () => h('div', 'Hello World'),
              }),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<title>Welcome Email</title>')
      expect(html).toContain('<body')
      expect(html).toContain('<div>Hello World</div>')
    })

    it('应该支持完整的邮件结构', async () => {
      const Component = defineComponent({
        setup() {
          return () => h(Html, { lang: 'zh-CN' }, {
            default: () => [
              h(Head, { title: '验证码邮件' }, {
                default: () => h(Preview, { children: '您的验证码是 123456' }),
              }),
              h(Body, { backgroundColor: '#ffffff' }, {
                default: () => [
                  h('div', { style: { padding: '20px' } }, '验证码: 123456'),
                ],
              }),
            ],
          })
        },
      })
      
      const html = await renderAsync(Component)
      expect(html).toContain('<html lang="zh-CN">')
      expect(html).toContain('<title>验证码邮件</title>')
      expect(html).toContain('data-preview="true"')
      expect(html).toContain('您的验证码是 123456')
      expect(html).toContain('background-color:#ffffff')
      expect(html).toContain('验证码: 123456')
    })
  })
})
