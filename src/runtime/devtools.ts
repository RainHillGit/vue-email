declare module '@nuxt/devtools' {
  interface DevTools {
    addPanel: (options: { id: string; title: string; icon?: string }) => void
  }

  export function defineDevTools(options: {
    title: string
    icon?: string
    setup?: (devTools: DevTools) => void
  }): any
}
