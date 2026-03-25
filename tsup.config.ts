import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/preview.ts',
    'src/vite-plugin.ts',
    'src/module.ts',
    'src/runtime/composables/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  clean: true,
  external: [
    'vue',
    'nuxt',
    '@nuxt/kit',
    '@vue/server-renderer',
    '@vue/runtime-core',
    'react',
    'react-dom',
    '@react-email/render',
    'resend',
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
