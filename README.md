# Vue Email

[![npm version](https://img.shields.io/npm/v/vue-email?label=vue-email)](https://www.npmjs.com/package/vue-email)
[![license](https://img.shields.io/npm/l/vue-email)](https://github.com/RainHillGit/vue-email/blob/main/LICENSE)

> Vue Email components library, inspired by React Email. Build beautiful emails with Vue components.

## ✨ Features

- 13+ email-optimized Vue components
- Server-side rendering engine
- Vite preview plugin with hot reload
- Nuxt 3 module with zero-config
- Resend integration for email sending
- TypeScript support with complete types

## 📦 Installation

```bash
npm install vue-email@alpha
# or
pnpm add vue-email@alpha
```

## 🚀 Quick Start

### Vite + Vue 3

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueEmail from 'vue-email/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueEmail(), // Zero config!
  ],
})
```

### Nuxt 3

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-email/module'],
  vueEmail: {
    autoImport: true,
    preview: { enabled: true },
  },
})
```

## 📚 Documentation

Check out the [full documentation](./DOCUMENTATION.md).

## 🎨 Components

### Layout

- `Html` - Root HTML wrapper
- `Head` - Head with title/meta
- `Body` - Body with reset styles
- `Container` - Centered container
- `Section` - Full-width section
- `Row` / `Column` - Grid layout

### Content

- `Text` - Paragraph text
- `Heading` - H1-H6 headings
- `Link` - Anchor links
- `Button` - CTA button
- `Image` - Responsive images
- `Hr` - Horizontal divider
- `Font` - Font family
- `Preview` - Email preview text

## 💻 Usage

### Render an Email

```typescript
import { renderAsync } from 'vue-email'
import WelcomeEmail from './Welcome.email.vue'

const html = await renderAsync(WelcomeEmail, {
  name: 'John Doe',
  verifyUrl: 'https://example.com/verify?token=xxx',
})
```

### Send with Resend

```typescript
// In Nuxt server API
const { sendWithComponent } = useResendEmail()

const result = await sendWithComponent(WelcomeEmail, { name: 'John' }, {
  to: 'user@example.com',
  from: 'Vue Email &lt;onboarding@resend.dev&gt;',
  subject: 'Welcome to Vue Email',
})
```

### Preview

Access the preview at: `http://localhost:5173/__vue-email-preview`

Features:
- Multi-email client simulation (Gmail/Outlook/Apple Mail)
- Responsive preview (Mobile/Tablet/Desktop)
- Source code view with syntax highlighting
- Props debugging panel
- Hot reload on file changes

## 📄 License

MIT

## 🤝 Contributing

Contributions, issues and feature requests are welcome on [GitHub](https://github.com/RainHillGit/vue-email/issues).

## 🌟 Show your support

Give a ⭐️ on [GitHub](https://github.com/RainHillGit/vue-email) if this project helped you!

---

**Note**: This is an alpha release. APIs may change.
