# Vue Email Vite Plugin 使用指南

## 安装

```bash
npm install vue-email
# 或者
pnpm add vue-email
```

## 基本使用

### 1. 在 Vite 配置中引入插件

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueEmail from 'vue-email'

export default defineConfig({
  plugins: [
    vue(),
    vueEmail({
      previewRoute: '/__vue-email-preview',
      renderRoute: '/__vue-email-preview/render',
      include: '**/*.email.vue',
      exclude: 'node_modules/**',
    }),
  ],
})
```

### 2. 创建邮件组件

创建 `.email.vue` 后缀的组件文件：

```vue
<!-- Welcome.email.vue -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()
</script>
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问预览页面

在浏览器中打开：`http://localhost:5173/__vue-email-preview`

## 配置选项

### previewRoute

预览页面的路由路径。

- 类型：`string`
- 默认值：`/__vue-email-preview`

### renderRoute

渲染 API 的路由路径。

- 类型：`string`
- 默认值：`/__vue-email-preview/render`

### include

监听的文件匹配模式。

- 类型：`string | string[]`
- 默认值：`**/*.email.vue`

### exclude

排除的文件匹配模式。

- 类型：`string | string[]`
- 默认值：`node_modules/**`

### defaultProps

传递给组件的默认 props。

- 类型：`Record<string, any>`
- 默认值：`{}`

### title

预览页面的标题。

- 类型：`string`
- 默认值：`Vue Email Preview`

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

## 热更新

插件支持热更新，当邮件组件文件发生变更时会自动通知预览页面刷新。

支持的变更类型：

- 文件新增
- 文件删除

## 注意事项

1. 插件会自动将 `vue`、`@vue/runtime-core` 等核心库加入 external，避免打包冗余代码
2. 插件使用 `configureServer` 钩子，不会修改用户的 build 配置
3. 插件使用 chokidar 监听文件变化，不会和用户的自定义配置冲突
4. 组件必须使用 `defineProps` 声明 props，才能在预览时传递参数

## 示例项目

参考 `demo/VerificationCode.email.ts` 和 `demo/OrderNotification.email.ts` 获取完整的邮件组件示例。
