# Vue Email 快速开始指南

## 模块说明

Vue Email 提供三个独立的模块：

| 模块 | 入口 | 说明 | 适用场景 |
|------|------|------|----------|
| 主模块 | `vue-email` | 组件库 + 渲染引擎 | 日常开发 |
| 预览模块 | `vue-email/preview` | 预览工具函数 | 按需引入 |
| Vite插件 | `vue-email/vite-plugin` | 开发服务器预览 | Vite项目 |
| Nuxt模块 | `vue-email/nuxt` | Nuxt集成 | Nuxt项目 |

---

## 安装

```bash
npm install vue-email
# 或者
pnpm add vue-email
```

---

## 方式一：Vite 项目中使用（推荐）

### 1. 配置 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueEmail from 'vue-email/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueEmail({
      // 预览页面路由（可选，默认 /__vue-email-preview）
      previewRoute: '/__vue-email-preview',

      // 渲染 API 路由（可选，默认 /__vue-email-preview/render）
      renderRoute: '/__vue-email-preview/render',

      // 监听的文件模式（可选，默认 **/*.email.vue）
      include: '**/*.email.vue',

      // 排除的文件模式（可选）
      exclude: 'node_modules/**',

      // 默认 props（可选）
      defaultProps: {},

      // 预览页面标题（可选）
      title: 'My Email Preview',
    }),
  ],
})
```

### 2. 创建邮件组件

创建 `.email.vue` 后缀的文件：

```vue
<!-- Welcome.email.vue -->
<template>
  <div class="email-container">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <Button href="https://example.com/verify">
      验证邮箱
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'vue-email'

defineProps<{
  title: string
  message: string
}>()
</script>

<style scoped>
.email-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
</style>
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问预览页面

打开浏览器访问：`http://localhost:5173/__vue-email-preview`

---

## 方式二：零配置快速上手

插件提供开箱即用的默认配置：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueEmail from 'vue-email/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueEmail(), // 零配置使用！
  ],
})
```

---

## 方式三：直接使用渲染引擎

如果你只需要服务端渲染能力，不需要预览功能：

```typescript
import { renderAsync } from 'vue-email'

// 渲染邮件组件
const html = await renderAsync(MyEmailComponent, {
  title: 'Hello',
  message: 'Welcome!'
}, {
  pretty: true,        // 格式化 HTML
  plainText: false,   // 输出纯文本
  injectDoctype: true // 注入 DOCTYPE
})
```

### 渲染选项 (RenderOptions)

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pretty` | `boolean` | `false` | 格式化输出 HTML |
| `plainText` | `boolean` | `false` | 输出纯文本 |
| `doctype` | `string` | `DTD` | 自定义 DOCTYPE |
| `injectDoctype` | `boolean` | `true` | 是否注入 DOCTYPE |
| `timeout` | `number` | - | 渲染超时时间(ms) |

---

## 预览模块工具函数

按需引入预览相关的工具函数：

```typescript
import {
  EMAIL_CLIENTS,
  normalizeFilePath,
  extractComponentName,
  processFileList,
  generatePreviewConfig,
  renderAsync,
} from 'vue-email/preview'

// 处理文件路径（跨平台兼容）
const path = normalizeFilePath('src\\emails\\Welcome.email.vue')
// => 'src/emails/Welcome.email.vue'

// 提取组件名称
const name = extractComponentName('src/emails/Welcome.email.vue')
// => 'Welcome'

// 处理文件列表
const files = processFileList(['src/emails/Welcome.email.vue'])
// => [{ name: 'Welcome', path: '...', componentName: '...' }]

// 生成预览配置
const config = generatePreviewConfig({
  title: 'My Preview',
  defaultProps: { theme: 'dark' }
})
```

---

## 高级功能

### 多邮箱模拟预览

点击工具栏的 **Gmail / Outlook / Apple Mail** 按钮，模拟不同邮箱的渲染效果。

### 响应式预览

点击 **Mobile / Tablet / Desktop** 按钮，或输入自定义宽度，测试不同视口下的渲染效果。

### HTML 源码查看

点击 **Source** 按钮，查看渲染后的完整 HTML 源码，支持一键复制。

### Props 动态调试

在底部的 Props 面板中修改 JSON，点击 **Apply** 实时预览效果。

---

## API 接口

### GET /__vue-email-preview

返回预览页面的 HTML。

### GET /__vue-email-preview/render?path=xxx&props={}

渲染指定的邮件组件。

**查询参数：**

- `path`：邮件组件的文件路径（相对于项目根目录）
- `props`：传递给组件的 props（JSON 格式）

**响应：** 渲染后的 HTML 字符串

### GET /__vue-email-preview/files

返回所有邮件组件文件的列表。

**响应：** JSON 数组

---

## 热更新

插件支持热更新，当邮件组件文件发生变更时会自动通知预览页面刷新。

---

## 示例项目

参考 `demo/VerificationCode.email.ts` 和 `demo/OrderNotification.email.ts` 获取完整的邮件组件示例。

---

## Nuxt 项目中使用

详见 [vue-email/nuxt](./NUXT.md)
