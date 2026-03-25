# Vue Email - v0.1.0-alpha

A Vue component library for building beautiful emails, inspired by React Email.

## Features

- 13+ email-optimized Vue components
- Server-side rendering engine
- Vite preview plugin with hot reload
- Nuxt 3 module with zero-config
- Resend integration for email sending

## Quick Start

### Installation

```bash
npm install vue-email@alpha
# or
pnpm add vue-email@alpha
```

### Vite + Vue 3

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueEmail from 'vue-email/vite-plugin'

export default defineConfig({
  plugins: [vue(), vueEmail()]
})
```

### Nuxt 3

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-email/module'],
  vueEmail: {
    autoImport: true,
    preview: { enabled: true }
  }
})
```

## Components

### Layout Components

- `Html` - Root HTML wrapper
- `Head` - Head section with title/meta
- `Body` - Body container with reset styles
- `Container` - Centered container (table-based)
- `Section` - Full-width section
- `Row` / `Column` - Grid layout

### Content Components

- `Text` - Paragraph text
- `Heading` - H1-H6 headings
- `Link` - Anchor links
- `Button` - Call-to-action button
- `Image` - Responsive images
- `Hr` - Horizontal divider
- `Font` - Font family wrapper
- `Preview` - Email preview text

## Rendering

```typescript
import { renderAsync } from 'vue-email'
import WelcomeEmail from './Welcome.email.vue'

const html = await renderAsync(WelcomeEmail, {
  name: 'John',
  verifyUrl: 'https://example.com/verify'
}, {
  pretty: true,
  injectDoctype: true
})
```

## Resend Integration

```typescript
// In Nuxt server API
const { sendWithComponent } = useResendEmail()

const result = await sendWithComponent(WelcomeEmail, { name: 'John' }, {
  to: 'user@example.com',
  from: 'Vue Email &lt;onboarding@resend.dev&gt;',
  subject: 'Welcome to Vue Email'
})
```

## Preview

Access the preview at `http://localhost:5173/__vue-email-preview`

- Multi-email client simulation (Gmail/Outlook/Apple Mail)
- Responsive preview (Mobile/Tablet/Desktop)
- Source code view with syntax highlighting
- Props debugging panel
- Hot reload

## API Reference

### Render Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pretty` | boolean | false | Format HTML output |
| `plainText` | boolean | false | Output plain text |
| `injectDoctype` | boolean | true | Inject DOCTYPE |
| `timeout` | number | - | Render timeout (ms) |

### Vite Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `previewRoute` | string | '/__vue-email-preview' | Preview page route |
| `renderRoute` | string | '/__vue-email-preview/render' | Render API route |
| `include` | string\|string[] | '**/*.email.vue' | File patterns to watch |
| `exclude` | string\|string[] | 'node_modules/**' | Patterns to exclude |
| `title` | string | 'Vue Email Preview' | Preview page title |
| `defaultProps` | object | {} | Default props for components |

### Nuxt Module Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoImport` | boolean | true | Auto-import components/composables |
| `componentPrefix` | string | '' | Component prefix |
| `preview.enabled` | boolean | true | Enable preview |
| `preview.previewRoute` | string | '/__vue-email-preview' | Preview route |
| `resend.apiKey` | string | - | Resend API key |
| `resend.from` | string | - | Default sender |
| `resend.retry.enabled` | boolean | false | Enable retry |
| `resend.retry.maxRetries` | number | 3 | Max retries |

## Composables

### useVueEmail()

```typescript
const { version, config, getConfig, renderEmail, getPreviewUrl } = useVueEmail()
```

### useResendEmail()

```typescript
const { config, send, sendWithComponent, isConfigured } = useResendEmail()

await send({
  to: 'user@example.com',
  from: 'Vue Email &lt;onboarding@resend.dev&gt;',
  subject: 'Test',
  html: '&lt;h1&gt;Hello&lt;/h1&gt;'
})

await sendWithComponent(MyEmail, { title: 'Hello' }, {
  to: 'user@example.com',
  subject: 'Welcome'
})
```

## Example Email Component

```vue
&lt;template&gt;
  &lt;Html lang="en"&gt;
    &lt;Head&gt;
      &lt;Title&gt;{{ title }}&lt;/Title&gt;
    &lt;/Head&gt;
    &lt;Body&gt;
      &lt;Container&gt;
        &lt;Section&gt;
          &lt;Heading as="h1"&gt;{{ title }}&lt;/Heading&gt;
          &lt;Text&gt;{{ message }}&lt;/Text&gt;
          &lt;Button href="{{ verifyUrl }}"&gt;
            Verify Email
          &lt;/Button&gt;
        &lt;/Section&gt;
      &lt;/Container&gt;
    &lt;/Body&gt;
  &lt;/Html&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
defineProps&lt;{
  title?: string
  message?: string
  verifyUrl?: string
}&gt;()
&lt;/script&gt;
```

## Changelog

### v0.1.0-alpha

- Initial release
- 13+ email components
- SSR rendering engine
- Vite preview plugin with hot reload
- Nuxt 3 module with zero-config
- Resend integration

## License

MIT
